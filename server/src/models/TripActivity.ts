import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TripActivityAttributes {
  id: string;
  trip_stop_id: string;
  activity_id: string;
  date: Date;
  time?: string;
  min_cost_override?: number;
  max_cost_override?: number;
  created_at: Date;
  updated_at: Date;
}

export interface TripActivityCreationAttributes extends Optional<TripActivityAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class TripActivity extends Model<TripActivityAttributes, TripActivityCreationAttributes> implements TripActivityAttributes {
  public id!: string;
  public trip_stop_id!: string;
  public activity_id!: string;
  public date!: Date;
  public time?: string;
  public min_cost_override?: number;
  public max_cost_override?: number;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Static methods for common queries
  static async findByTripStopId(tripStopId: string): Promise<TripActivity[]> {
    return await TripActivity.findAll({ 
      where: { trip_stop_id: tripStopId },
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
  }

  static async findByActivityId(activityId: string): Promise<TripActivity[]> {
    return await TripActivity.findAll({ where: { activity_id: activityId } });
  }

  static async findByDate(date: Date): Promise<TripActivity[]> {
    return await TripActivity.findAll({ 
      where: { date },
      order: [['time', 'ASC']]
    });
  }

  static async findByTripStopAndDate(tripStopId: string, date: Date): Promise<TripActivity[]> {
    return await TripActivity.findAll({ 
      where: { 
        trip_stop_id: tripStopId,
        date 
      },
      order: [['time', 'ASC']]
    });
  }

  static async findByDateRange(startDate: Date, endDate: Date): Promise<TripActivity[]> {
    return await TripActivity.findAll({
      where: sequelize.and(
        sequelize.where(sequelize.col('date'), '>=', startDate),
        sequelize.where(sequelize.col('date'), '<=', endDate)
      ),
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
  }

  static async findWithCostOverrides(): Promise<TripActivity[]> {
    return await TripActivity.findAll({
      where: sequelize.or(
        sequelize.where(sequelize.col('min_cost_override'), 'IS NOT', null),
        sequelize.where(sequelize.col('max_cost_override'), 'IS NOT', null)
      )
    });
  }

  static async getTotalCostForTripStop(tripStopId: string): Promise<{ min: number; max: number }> {
    const activities = await TripActivity.findAll({
      where: { trip_stop_id: tripStopId },
      include: [{
        association: 'activity',
        attributes: ['min_cost', 'max_cost']
      }]
    });

    let totalMin = 0;
    let totalMax = 0;

    activities.forEach((tripActivity: any) => {
      const minCost = tripActivity.min_cost_override || tripActivity.activity?.min_cost || 0;
      const maxCost = tripActivity.max_cost_override || tripActivity.activity?.max_cost || 0;
      
      totalMin += minCost;
      totalMax += maxCost;
    });

    return { min: totalMin, max: totalMax };
  }
}

TripActivity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trip_stop_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'trip_stops',
        key: 'id'
      }
    },
    activity_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'activities',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    min_cost_override: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'User customized lower bound cost'
    },
    max_cost_override: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'User customized upper bound cost'
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
    tableName: 'trip_activities',
    modelName: 'TripActivity',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['trip_stop_id']
      },
      {
        fields: ['activity_id']
      },
      {
        fields: ['date']
      },
      {
        fields: ['trip_stop_id', 'date']
      },
      {
        fields: ['trip_stop_id', 'date', 'time']
      },
      {
        unique: true,
        fields: ['trip_stop_id', 'activity_id', 'date', 'time'],
        name: 'unique_trip_activity_schedule'
      }
    ]
  }
);
