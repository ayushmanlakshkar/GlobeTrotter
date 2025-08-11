import sequelize from '../config/database';

// Import all models
import { User } from './User';
import { Trip } from './Trip';
import { City } from './City';
import { TripStop } from './TripStop';
import { Activity } from './Activity';
import { TripActivity } from './TripActivity';

// Define associations
const initializeAssociations = () => {
  // User has many Trips
  User.hasMany(Trip, {
    foreignKey: 'user_id',
    as: 'trips'
  });
  Trip.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Trip has many TripStops
  Trip.hasMany(TripStop, {
    foreignKey: 'trip_id',
    as: 'tripStops'
  });
  TripStop.belongsTo(Trip, {
    foreignKey: 'trip_id',
    as: 'trip'
  });

  // City has many TripStops
  City.hasMany(TripStop, {
    foreignKey: 'city_id',
    as: 'tripStops'
  });
  TripStop.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'city'
  });

  // City has many Activities
  City.hasMany(Activity, {
    foreignKey: 'city_id',
    as: 'activities'
  });
  Activity.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'city'
  });

  // TripStop has many TripActivities
  TripStop.hasMany(TripActivity, {
    foreignKey: 'trip_stop_id',
    as: 'tripActivities'
  });
  TripActivity.belongsTo(TripStop, {
    foreignKey: 'trip_stop_id',
    as: 'tripStop'
  });

  // Activity has many TripActivities
  Activity.hasMany(TripActivity, {
    foreignKey: 'activity_id',
    as: 'tripActivities'
  });
  TripActivity.belongsTo(Activity, {
    foreignKey: 'activity_id',
    as: 'activity'
  });
};

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Initialize associations
    initializeAssociations();
    console.log('Model associations initialized.');
    
    // Sync all models
    await sequelize.sync({ force: false }); // Temporarily set to true to recreate tables with correct types
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { 
  User, 
  Trip, 
  City, 
  TripStop, 
  Activity, 
  TripActivity, 
  initDatabase 
};
export default sequelize;
