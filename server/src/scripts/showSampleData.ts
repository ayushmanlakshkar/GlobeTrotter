/**
 * Example script showing how to use the seeded data
 * Run this after seeding to see the data in action
 */

import sequelize from '../config/database';
import { User, City, Trip, Activity, TripStop, TripActivity } from '../models/index';

// Define associations function (copied from models/index.ts)
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

async function demonstrateSeededData() {
  try {
    await sequelize.authenticate();
    
    // Initialize associations before using them
    initializeAssociations();
    console.log('📊 GlobeTrotter Database Sample Data Overview\n');

    // Show users
    const users = await User.findAll({
      attributes: ['first_name', 'last_name', 'username', 'email', 'city', 'country']
    });
    console.log(`👥 Users (${users.length}):`);
    users.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.first_name} ${user.last_name} (@${user.username}) - ${user.city}, ${user.country}`);
    });

    // Show cities
    const cities = await City.findAll({
      attributes: ['name', 'country', 'cost_index', 'popularity']
    });
    console.log(`\n🏙️  Cities (${cities.length}):`);
    cities.forEach((city, i) => {
      console.log(`  ${i + 1}. ${city.name}, ${city.country} (Cost: ${city.cost_index}, Popularity: ${city.popularity})`);
    });

    // Show trips with user info
    const trips = await Trip.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['first_name', 'last_name', 'username']
      }],
      attributes: ['name', 'description', 'start_date', 'end_date', 'is_public']
    });
    console.log(`\n✈️  Trips (${trips.length}):`);
    trips.forEach((trip, i) => {
      const user = (trip as any).user;
      console.log(`  ${i + 1}. "${trip.name}" by ${user.first_name} ${user.last_name} (@${user.username})`);
      console.log(`     ${trip.start_date.toDateString()} → ${trip.end_date.toDateString()} | ${trip.is_public ? 'Public' : 'Private'}`);
    });

    // Show activities by city
    const activities = await Activity.findAll({
      include: [{
        model: City,
        as: 'city',
        attributes: ['name', 'country']
      }],
      attributes: ['name', 'category', 'duration', 'min_cost', 'max_cost']
    });
    console.log(`\n🎯 Activities (${activities.length}):`);
    activities.forEach((activity, i) => {
      const city = (activity as any).city;
      const costRange = activity.min_cost === activity.max_cost 
        ? `$${activity.min_cost}` 
        : `$${activity.min_cost}-${activity.max_cost}`;
      console.log(`  ${i + 1}. ${activity.name} in ${city.name} (${activity.category}, ${activity.duration}h, ${costRange})`);
    });

    // Show detailed trip with stops and activities
    const detailedTrip = await Trip.findOne({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['first_name', 'last_name']
        },
        {
          model: TripStop,
          as: 'tripStops',
          include: [
            {
              model: City,
              as: 'city',
              attributes: ['name', 'country']
            },
            {
              model: TripActivity,
              as: 'tripActivities',
              include: [{
                model: Activity,
                as: 'activity',
                attributes: ['name', 'category']
              }]
            }
          ]
        }
      ],
      order: [
        [{ model: TripStop, as: 'tripStops' }, 'order_index', 'ASC'],
        [{ model: TripStop, as: 'tripStops' }, { model: TripActivity, as: 'tripActivities' }, 'date', 'ASC']
      ]
    });

    if (detailedTrip) {
      console.log(`\n📋 Detailed Trip Example: "${detailedTrip.name}"`);
      console.log(`   Traveler: ${(detailedTrip as any).user.first_name} ${(detailedTrip as any).user.last_name}`);
      
      const tripStops = (detailedTrip as any).tripStops || [];
      tripStops.forEach((stop: any, i: number) => {
        const city = stop.city;
        console.log(`   Stop ${stop.order_index}: ${city.name}, ${city.country}`);
        console.log(`   📅 ${stop.start_date.toDateString()} → ${stop.end_date.toDateString()}`);
        
        const activities = stop.tripActivities || [];
        if (activities.length > 0) {
          console.log(`   Activities:`);
          activities.forEach((tripActivity: any) => {
            const activity = tripActivity.activity;
            // Ensure date is a Date object before calling toDateString
            const activityDate = tripActivity.date instanceof Date 
              ? tripActivity.date 
              : new Date(tripActivity.date);
            console.log(`     • ${activity.name} (${activity.category}) - ${activityDate.toDateString()} ${tripActivity.time || ''}`);
          });
        }
        console.log();
      });
    }

    // Show some statistics
    console.log('📈 Statistics:');
    const publicTrips = await Trip.count({ where: { is_public: true } });
    const totalStops = await TripStop.count();
    const totalActivities = await TripActivity.count();
    
    console.log(`   • ${publicTrips} public trips out of ${trips.length} total`);
    console.log(`   • ${totalStops} trip stops across all trips`);
    console.log(`   • ${totalActivities} planned activities`);
    console.log(`   • Average ${(totalStops / trips.length).toFixed(1)} stops per trip`);

    console.log('\n✅ Sample data overview complete!');
    console.log('\n💡 Tips:');
    console.log('   • Use these sample users to test authentication');
    console.log('   • All users have password: "password123"');
    console.log('   • Try the API endpoints with the seeded data');
    console.log('   • Modify the seed data in src/seeds/seedData.ts to fit your needs');

  } catch (error) {
    console.error('❌ Error retrieving sample data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run if executed directly
if (require.main === module) {
  demonstrateSeededData();
}

export default demonstrateSeededData;
