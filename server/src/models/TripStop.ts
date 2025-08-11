import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TripStopAttributes {
  id: string;
  trip_id: string;
  city_id: string;
  start_date: Date;
  end_date: Date;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface TripStopCreationAttributes extends Optional<TripStopAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class TripStop extends Model<TripStopAttributes, TripStopCreationAttributes> implements TripStopAttributes {
  public id!: string;
  public trip_id!: string;
  public city_id!: string;
  public start_date!: Date;
  public end_date!: Date;
  public order_index!: number;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Static methods for common queries
  static async findByTripId(tripId: string): Promise<TripStop[]> {
    return await TripStop.findAll({ 
      where: { trip_id: tripId },
      order: [['order_index', 'ASC']]
    });
  }

  static async findByCityId(cityId: string): Promise<TripStop[]> {
    return await TripStop.findAll({ where: { city_id: cityId } });
  }

  static async findByTripIdAndOrderedByIndex(tripId: string): Promise<TripStop[]> {
    return await TripStop.findAll({ 
      where: { trip_id: tripId },
      order: [['order_index', 'ASC']]
    });
  }

  static async getMaxOrderIndexForTrip(tripId: string): Promise<number> {
    const result = await TripStop.max('order_index', { where: { trip_id: tripId } });
    return result ? Number(result) : 0;
  }
}

TripStop.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trip_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    city_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'id'
      }
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: 'trip_stops',
    modelName: 'TripStop',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['trip_id']
      },
      {
        fields: ['city_id']
      },
      {
        unique: true,
        fields: ['trip_id', 'order_index']
      }
    ]
  }
);
