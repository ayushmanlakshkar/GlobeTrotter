import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

export interface TripAttributes {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  cover_photo?: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TripCreationAttributes extends Optional<TripAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Trip extends Model<TripAttributes, TripCreationAttributes> implements TripAttributes {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public description?: string;
  public start_date!: Date;
  public end_date!: Date;
  public cover_photo?: string;
  public is_public!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Static methods for common queries
  static async findByUserId(userId: string): Promise<Trip[]> {
    return await Trip.findAll({ where: { user_id: userId } });
  }

  static async findPublicTrips(): Promise<Trip[]> {
    return await Trip.findAll({ where: { is_public: true } });
  }

  static async findByUserIdAndPublic(userId: string): Promise<Trip[]> {
    return await Trip.findAll({ 
      where: { 
        user_id: userId,
        is_public: true 
      } 
    });
  }

  /**
   * Find popular trips in the same country as the user, excluding user's own trips
   */
  static async findRegionalSelections(userId: string, userCountry: string, limit: number = 10, offset: number = 0): Promise<Trip[]> {
    // Import here to avoid circular dependency
    const { User } = require('./User');
    const { TripStop } = require('./TripStop');
    const { City } = require('./City');

    return await Trip.findAll({
      include: [
        {
          model: User,
          as: 'user',
          where: { 
            country: userCountry,
            id: { [Op.ne]: userId } // Exclude current user's trips
          },
          attributes: ['id', 'first_name', 'last_name', 'username', 'city']
        },
        {
          model: TripStop,
          as: 'tripStops',
          include: [
            {
              model: City,
              as: 'city',
              attributes: ['id', 'name', 'country']
            }
          ]
        }
      ],
      where: {
        is_public: true,
        end_date: { [Op.gte]: new Date() } // Only include current/future trips
      },
      order: [
        ['created_at', 'DESC'], // Most recent first
        ['end_date', 'ASC']     // Then by end date
      ],
      limit: limit,
      offset: offset
    });
  }

  /**
   * Find user's previous trips (completed trips)
   */
  static async findPreviousTrips(userId: string, limit: number = 10, offset: number = 0): Promise<Trip[]> {
    // Import here to avoid circular dependency
    const { TripStop } = require('./TripStop');
    const { City } = require('./City');
    const { TripActivity } = require('./TripActivity');
    const { Activity } = require('./Activity');

    return await Trip.findAll({
      where: {
        user_id: userId
      },
      include: [
        {
          model: TripStop,
          as: 'tripStops',
          include: [
            {
              model: City,
              as: 'city',
              attributes: ['id', 'name', 'country']
            },
            {
              model: TripActivity,
              as: 'tripActivities',
              include: [
                {
                  model: Activity,
                  as: 'activity',
                  attributes: ['id', 'name', 'category', 'description']
                }
              ]
            }
          ]
        }
      ],
      order: [
        ['end_date', 'DESC'], // Most recent first
        [{ model: TripStop, as: 'tripStops' }, 'order_index', 'ASC']
      ],
      limit: limit,
      offset: offset
    });
  }

  /**
   * Find user's upcoming trips (future trips)
   */
  static async findUpcomingTrips(userId: string, limit: number = 10, offset: number = 0): Promise<Trip[]> {
    // Import here to avoid circular dependency
    const { TripStop } = require('./TripStop');
    const { City } = require('./City');
    const { TripActivity } = require('./TripActivity');
    const { Activity } = require('./Activity');

    return await Trip.findAll({
      where: {
        user_id: userId,
        start_date: { [Op.gt]: new Date() } // Only future trips
      },
      include: [
        {
          model: TripStop,
          as: 'tripStops',
          include: [
            {
              model: City,
              as: 'city',
              attributes: ['id', 'name', 'country']
            },
            {
              model: TripActivity,
              as: 'tripActivities',
              include: [
                {
                  model: Activity,
                  as: 'activity',
                  attributes: ['id', 'name', 'category', 'description']
                }
              ]
            }
          ]
        }
      ],
      order: [
        ['start_date', 'ASC'], // Earliest first
        [{ model: TripStop, as: 'tripStops' }, 'order_index', 'ASC']
      ],
      limit: limit,
      offset: offset
    });
  }

  /**
   * Find a trip by ID with full details (for both owner and public access)
   */
  static async findByIdWithDetails(tripId: string, userId: string): Promise<Trip | null> {
    // Import here to avoid circular dependency
    const { User } = require('./User');
    const { TripStop } = require('./TripStop');
    const { City } = require('./City');
    const { TripActivity } = require('./TripActivity');
    const { Activity } = require('./Activity');

    return await Trip.findOne({
      where: {
        id: tripId,
        [Op.or]: [
          { user_id: userId }, // User's own trip
          { is_public: true }   // Or public trip
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'username', 'city', 'country']
        },
        {
          model: TripStop,
          as: 'tripStops',
          include: [
            {
              model: City,
              as: 'city',
              attributes: ['id', 'name', 'country']
            },
            {
              model: TripActivity,
              as: 'tripActivities',
              include: [
                {
                  model: Activity,
                  as: 'activity',
                  attributes: ['id', 'name', 'category', 'description']
                }
              ]
            }
          ]
        }
      ],
      order: [
        [{ model: TripStop, as: 'tripStops' }, 'order_index', 'ASC']
      ]
    });
  }
}

Trip.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cover_photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'trips',
    modelName: 'Trip',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['is_public']
      },
      {
        fields: ['start_date']
      }
    ]
  }
);
