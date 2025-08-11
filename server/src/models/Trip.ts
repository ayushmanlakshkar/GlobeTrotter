import { DataTypes, Model, Optional } from 'sequelize';
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
