import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

export interface CityAttributes {
  id: string;
  name: string;
  country: string;
  cost_index?: number;
  popularity?: number;
  description?: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CityCreationAttributes extends Optional<CityAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
  public id!: string;
  public name!: string;
  public country!: string;
  public cost_index?: number;
  public popularity?: number;
  public description?: string;
  public image_url?: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Static methods for common queries
  static async findByName(name: string): Promise<City[]> {
    return await City.findAll({ where: { name } });
  }

  static async findByCountry(country: string): Promise<City[]> {
    return await City.findAll({ where: { country } });
  }

  static async findByNameAndCountry(name: string, country: string): Promise<City | null> {
    return await City.findOne({ where: { name, country } });
  }

  static async findPopularCities(limit: number = 10): Promise<City[]> {
    return await City.findAll({ 
      where: sequelize.where(
        sequelize.col('popularity'),
        Op.ne,
        null
      ),
      order: [['popularity', 'DESC']],
      limit
    });
  }

  static async findByCostRange(minCost: number, maxCost: number): Promise<City[]> {
    return await City.findAll({ 
      where: { 
        cost_index: { 
          [Op.between]: [minCost, maxCost] 
        } 
      } 
    });
  }

  static async searchCities(searchTerm: string): Promise<City[]> {
    return await City.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { country: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      }
    });
  }
}

City.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cost_index: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    popularity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'cities',
    modelName: 'City',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['country']
      },
      {
        fields: ['name', 'country']
      },
      {
        fields: ['popularity']
      },
      {
        fields: ['cost_index']
      }
    ]
  }
);
