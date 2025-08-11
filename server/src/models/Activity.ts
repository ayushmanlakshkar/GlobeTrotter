import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum ActivityCategory {
  SIGHTSEEING = 'sightseeing',
  FOOD = 'food',
  ADVENTURE = 'adventure',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  CULTURE = 'culture',
  NATURE = 'nature',
  SPORTS = 'sports',
  NIGHTLIFE = 'nightlife',
  RELAXATION = 'relaxation'
}

export interface ActivityAttributes {
  id: string;
  city_id: string;
  name: string;
  description?: string;
  min_cost?: number;
  max_cost?: number;
  duration?: number;
  category: ActivityCategory;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityCreationAttributes extends Optional<ActivityAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Activity extends Model<ActivityAttributes, ActivityCreationAttributes> implements ActivityAttributes {
  public id!: string;
  public city_id!: string;
  public name!: string;
  public description?: string;
  public min_cost?: number;
  public max_cost?: number;
  public duration?: number;
  public category!: ActivityCategory;
  public image_url?: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Static methods for common queries
  static async findByCityId(cityId: string): Promise<Activity[]> {
    return await Activity.findAll({ where: { city_id: cityId } });
  }

  static async findByCategory(category: ActivityCategory): Promise<Activity[]> {
    return await Activity.findAll({ where: { category } });
  }

  static async findByCityAndCategory(cityId: string, category: ActivityCategory): Promise<Activity[]> {
    return await Activity.findAll({ 
      where: { 
        city_id: cityId,
        category 
      } 
    });
  }

  static async findByCostRange(minBudget: number, maxBudget: number): Promise<Activity[]> {
    return await Activity.findAll({
      where: sequelize.and(
        sequelize.or(
          { min_cost: null },
          sequelize.where(sequelize.col('min_cost'), '<=', maxBudget)
        ),
        sequelize.or(
          { max_cost: null },
          sequelize.where(sequelize.col('max_cost'), '>=', minBudget)
        )
      )
    });
  }

  static async findByDurationRange(minDuration: number, maxDuration: number): Promise<Activity[]> {
    return await Activity.findAll({
      where: sequelize.and(
        sequelize.where(sequelize.col('duration'), '>=', minDuration),
        sequelize.where(sequelize.col('duration'), '<=', maxDuration)
      )
    });
  }

  static async searchActivities(searchTerm: string): Promise<Activity[]> {
    return await Activity.findAll({
      where: sequelize.or(
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          'LIKE',
          `%${searchTerm.toLowerCase()}%`
        ),
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('description')),
          'LIKE',
          `%${searchTerm.toLowerCase()}%`
        )
      )
    });
  }

  static async findByCityAndCostRange(cityId: string, minBudget: number, maxBudget: number): Promise<Activity[]> {
    return await Activity.findAll({
      where: sequelize.and(
        { city_id: cityId },
        sequelize.or(
          { min_cost: null },
          sequelize.where(sequelize.col('min_cost'), '<=', maxBudget)
        ),
        sequelize.or(
          { max_cost: null },
          sequelize.where(sequelize.col('max_cost'), '>=', minBudget)
        )
      )
    });
  }
}

Activity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    city_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cities',
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
    min_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    max_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in minutes'
    },
    category: {
      type: DataTypes.ENUM(...Object.values(ActivityCategory)),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
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
    tableName: 'activities',
    modelName: 'Activity',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['city_id']
      },
      {
        fields: ['category']
      },
      {
        fields: ['min_cost']
      },
      {
        fields: ['max_cost']
      },
      {
        fields: ['duration']
      },
      {
        fields: ['city_id', 'category']
      }
    ]
  }
);
