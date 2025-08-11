import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { User } from '../models/User';
import { City } from '../models/City';
import { Trip } from '../models/Trip';
import { Activity, ActivityCategory } from '../models/Activity';
import { TripStop } from '../models/TripStop';
import { TripActivity } from '../models/TripActivity';

// Import associations
import '../models/index';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const seedUsers = async () => {
  const users = [
    {
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      phone_number: '+1234567890',
      city: 'New York',
      country: 'United States',
      password_hash: await hashPassword('password123'),
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      additional_info: 'Love exploring new cultures and trying local cuisines.'
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      username: 'janesmith',
      email: 'jane.smith@example.com',
      phone_number: '+1234567891',
      city: 'Los Angeles',
      country: 'United States',
      password_hash: await hashPassword('password123'),
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
      additional_info: 'Adventure seeker and photography enthusiast.'
    },
    {
      first_name: 'Michael',
      last_name: 'Johnson',
      username: 'mikejohnson',
      email: 'michael.johnson@example.com',
      phone_number: '+1234567892',
      city: 'Chicago',
      country: 'United States',
      password_hash: await hashPassword('password123'),
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      additional_info: 'Travel blogger and nature lover.'
    },
    {
      first_name: 'Emily',
      last_name: 'Davis',
      username: 'emilydavis',
      email: 'emily.davis@example.com',
      phone_number: '+1234567893',
      city: 'Toronto',
      country: 'Canada',
      password_hash: await hashPassword('password123'),
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      additional_info: 'Digital nomad passionate about sustainable travel.'
    },
    {
      first_name: 'David',
      last_name: 'Wilson',
      username: 'davidwilson',
      email: 'david.wilson@example.com',
      phone_number: '+1234567894',
      city: 'London',
      country: 'United Kingdom',
      password_hash: await hashPassword('password123'),
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      additional_info: 'History buff who enjoys exploring ancient sites.'
    }
  ];

  console.log('Seeding users...');
  return await User.bulkCreate(users);
};

const seedCities = async () => {
  const cities = [
    {
      name: 'Paris',
      country: 'France',
      cost_index: 85,
      popularity: 95,
      description: 'The City of Light, known for its art, fashion, gastronomy and culture.',
      image_url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800'
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      cost_index: 90,
      popularity: 92,
      description: 'A bustling metropolis blending traditional culture with cutting-edge technology.',
      image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'
    },
    {
      name: 'New York',
      country: 'United States',
      cost_index: 95,
      popularity: 88,
      description: 'The Big Apple - a global hub for finance, arts, fashion, and culture.',
      image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      cost_index: 70,
      popularity: 87,
      description: 'Known for its architecture, beaches, and vibrant nightlife.',
      image_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800'
    },
    {
      name: 'Bangkok',
      country: 'Thailand',
      cost_index: 45,
      popularity: 85,
      description: 'A vibrant city known for ornate shrines, street food, and bustling markets.',
      image_url: 'https://images.unsplash.com/photo-1563492065910-1e4ec48792f3?w=800'
    },
    {
      name: 'Rome',
      country: 'Italy',
      cost_index: 75,
      popularity: 90,
      description: 'The Eternal City, filled with ancient history and incredible architecture.',
      image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800'
    },
    {
      name: 'Sydney',
      country: 'Australia',
      cost_index: 88,
      popularity: 83,
      description: 'Harbor city known for its Opera House, beaches, and laid-back lifestyle.',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    },
    {
      name: 'Amsterdam',
      country: 'Netherlands',
      cost_index: 80,
      popularity: 81,
      description: 'Known for its canals, museums, and cycling culture.',
      image_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800'
    }
  ];

  console.log('Seeding cities...');
  return await City.bulkCreate(cities);
};

const seedActivities = async (cities: City[]) => {
  const activities = [
    // Paris activities
    {
      city_id: cities[0].id,
      name: 'Visit the Eiffel Tower',
      description: 'Iconic iron lattice tower and symbol of Paris',
      category: ActivityCategory.SIGHTSEEING,
      duration: 2,
      min_cost: 20,
      max_cost: 30,
      image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400'
    },
    {
      city_id: cities[0].id,
      name: 'Louvre Museum Tour',
      description: 'World\'s largest art museum and historic monument',
      category: ActivityCategory.CULTURE,
      duration: 4,
      min_cost: 15,
      max_cost: 15,
      image_url: 'https://images.unsplash.com/photo-1566139884914-2a9abb3d1e75?w=400'
    },
    // Tokyo activities
    {
      city_id: cities[1].id,
      name: 'Senso-ji Temple Visit',
      description: 'Ancient Buddhist temple in Asakusa district',
      category: ActivityCategory.CULTURE,
      duration: 2,
      min_cost: 0,
      max_cost: 0,
      image_url: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400'
    },
    {
      city_id: cities[1].id,
      name: 'Tsukiji Fish Market',
      description: 'Famous fish market with fresh sushi and seafood',
      category: ActivityCategory.FOOD,
      duration: 3,
      min_cost: 25,
      max_cost: 35,
      image_url: 'https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400'
    },
    // New York activities
    {
      city_id: cities[2].id,
      name: 'Central Park Walk',
      description: 'Stroll through Manhattan\'s green oasis',
      category: ActivityCategory.NATURE,
      duration: 2,
      min_cost: 0,
      max_cost: 0,
      image_url: 'https://images.unsplash.com/photo-1572276596237-5db2c3e16c5d?w=400'
    },
    {
      city_id: cities[2].id,
      name: 'Broadway Show',
      description: 'Experience world-class theater in Times Square',
      category: ActivityCategory.ENTERTAINMENT,
      duration: 3,
      min_cost: 80,
      max_cost: 200,
      image_url: 'https://images.unsplash.com/photo-1507246965332-8490533b5036?w=400'
    },
    // Barcelona activities
    {
      city_id: cities[3].id,
      name: 'Sagrada Familia Tour',
      description: 'Gaudí\'s masterpiece basilica',
      category: ActivityCategory.SIGHTSEEING,
      duration: 2,
      min_cost: 20,
      max_cost: 20,
      image_url: 'https://images.unsplash.com/photo-1558642891-54be180ea339?w=400'
    },
    {
      city_id: cities[3].id,
      name: 'Beach Day at Barceloneta',
      description: 'Relax on Barcelona\'s main beach',
      category: ActivityCategory.RELAXATION,
      duration: 4,
      min_cost: 5,
      max_cost: 15,
      image_url: 'https://images.unsplash.com/photo-1471872406091-4d97b2c46814?w=400'
    }
  ];

  console.log('Seeding activities...');
  return await Activity.bulkCreate(activities);
};

const seedTrips = async (users: User[]) => {
  const trips = [
    {
      user_id: users[0].id,
      name: 'European Summer Adventure',
      description: 'A month-long journey through the best of Europe',
      start_date: new Date('2024-06-15'),
      end_date: new Date('2024-07-15'),
      cover_photo: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      is_public: true
    },
    {
      user_id: users[1].id,
      name: 'Asian Food Discovery',
      description: 'Exploring the culinary delights of Asia',
      start_date: new Date('2024-09-01'),
      end_date: new Date('2024-09-20'),
      cover_photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      is_public: true
    },
    {
      user_id: users[2].id,
      name: 'USA East Coast Tour',
      description: 'From New York to Miami - the ultimate road trip',
      start_date: new Date('2024-10-05'),
      end_date: new Date('2024-10-25'),
      cover_photo: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800',
      is_public: false
    },
    {
      user_id: users[3].id,
      name: 'Mediterranean Escape',
      description: 'Sun, sea, and culture around the Mediterranean',
      start_date: new Date('2024-05-10'),
      end_date: new Date('2024-05-30'),
      cover_photo: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800',
      is_public: true
    },
    {
      user_id: users[4].id,
      name: 'Ancient Wonders Journey',
      description: 'Exploring historical sites and ancient civilizations',
      start_date: new Date('2024-08-01'),
      end_date: new Date('2024-08-21'),
      cover_photo: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800',
      is_public: true
    }
  ];

  console.log('Seeding trips...');
  return await Trip.bulkCreate(trips);
};

const seedTripStops = async (trips: Trip[], cities: City[]) => {
  const tripStops = [
    // European Summer Adventure stops
    {
      trip_id: trips[0].id,
      city_id: cities[0].id, // Paris
      order_index: 1,
      start_date: new Date('2024-06-15'),
      end_date: new Date('2024-06-25')
    },
    {
      trip_id: trips[0].id,
      city_id: cities[3].id, // Barcelona
      order_index: 2,
      start_date: new Date('2024-06-25'),
      end_date: new Date('2024-07-05')
    },
    {
      trip_id: trips[0].id,
      city_id: cities[5].id, // Rome
      order_index: 3,
      start_date: new Date('2024-07-05'),
      end_date: new Date('2024-07-15')
    },
    // Asian Food Discovery stops
    {
      trip_id: trips[1].id,
      city_id: cities[1].id, // Tokyo
      order_index: 1,
      start_date: new Date('2024-09-01'),
      end_date: new Date('2024-09-10')
    },
    {
      trip_id: trips[1].id,
      city_id: cities[4].id, // Bangkok
      order_index: 2,
      start_date: new Date('2024-09-10'),
      end_date: new Date('2024-09-20')
    },
    // USA East Coast Tour
    {
      trip_id: trips[2].id,
      city_id: cities[2].id, // New York
      order_index: 1,
      start_date: new Date('2024-10-05'),
      end_date: new Date('2024-10-15')
    }
  ];

  console.log('Seeding trip stops...');
  return await TripStop.bulkCreate(tripStops);
};

const seedTripActivities = async (tripStops: TripStop[], activities: Activity[]) => {
  const tripActivities = [
    // Paris activities for European trip
    {
      trip_stop_id: tripStops[0].id,
      activity_id: activities[0].id, // Eiffel Tower
      date: new Date('2024-06-16'),
      time: '14:00'
    },
    {
      trip_stop_id: tripStops[0].id,
      activity_id: activities[1].id, // Louvre
      date: new Date('2024-06-18'),
      time: '10:00'
    },
    // Barcelona activities
    {
      trip_stop_id: tripStops[1].id,
      activity_id: activities[6].id, // Sagrada Familia
      date: new Date('2024-06-26'),
      time: '11:00'
    },
    {
      trip_stop_id: tripStops[1].id,
      activity_id: activities[7].id, // Beach
      date: new Date('2024-06-28'),
      time: '13:00'
    },
    // Tokyo activities
    {
      trip_stop_id: tripStops[3].id,
      activity_id: activities[2].id, // Senso-ji Temple
      date: new Date('2024-09-02'),
      time: '08:00'
    },
    {
      trip_stop_id: tripStops[3].id,
      activity_id: activities[3].id, // Fish Market
      date: new Date('2024-09-04'),
      time: '06:00'
    }
  ];

  console.log('Seeding trip activities...');
  return await TripActivity.bulkCreate(tripActivities);
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models (this will create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('Database models synchronized.');

    // Check if data already exists
    const userCount = await User.count();
    // if (userCount > 0) {
    //   console.log('Database already contains data. Skipping seeding.');
    //   return;
    // }

    // Seed data in order due to foreign key constraints
    const users = await seedUsers();
    const cities = await seedCities();
    const activities = await seedActivities(cities);
    const trips = await seedTrips(users);
    const tripStops = await seedTripStops(trips, cities);
    const tripActivities = await seedTripActivities(tripStops, activities);

    console.log('✅ Database seeding completed successfully!');
    console.log(`Created:
    - ${users.length} users
    - ${cities.length} cities  
    - ${activities.length} activities
    - ${trips.length} trips
    - ${tripStops.length} trip stops
    - ${tripActivities.length} trip activities`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
export { seedUsers, seedCities, seedActivities, seedTrips, seedTripStops, seedTripActivities };
