/**
 * Example script showing how to use the seeded data
 * Run this after seeding to see the data in action
 */

import sequelize from '../config/database';
import { User } from '../models/User';
import { City } from '../models/City';
import { Trip } from '../models/Trip';
import { Activity } from '../models/Activity';
import { TripStop } from '../models/TripStop';
import { TripActivity } from '../models/TripActivity';

// Import associations
import '../models/index';

async function demonstrateSeededData() {
  try {
    await sequelize.authenticate();
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
            console.log(`     • ${activity.name} (${activity.category}) - ${tripActivity.date.toDateString()} ${tripActivity.time || ''}`);
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
