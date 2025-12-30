import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/problemModel.js';

// Load environment variables
dotenv.config();

// Debug log to check if .env is loaded
console.log('Environment variables:', {
  MONGO_URI: process.env.MONGODB_URI ? 'Found' : 'Not found',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

// MongoDB connection URL
const mongoDBURL = process.env.MONGODB_URI;

if (!mongoDBURL) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('Connecting to MongoDB...');

const sampleProblems = [
  {
    title: "Two Sum",
    description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    difficulty: "easy",
    category: ["Array", "Hash Table"],
    tags: "array hash table",
    functionSignature: {
      name: "twoSum",
      params: ["number[] nums", "number target"],  
      returnType: "number[]"
    },
    starterCode: {
      "javascript": "var twoSum = function(nums, target) {\n    // Your code here\n};",
      "python": "def twoSum(nums, target):\n    # Your code here\n    pass",
      "c": "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Your code here\n    *returnSize = 2;\n    int* result = (int*)malloc(2 * sizeof(int));\n    // Add logic here\n    return result;\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};"
    },
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        isPublic: true,
        explanation: ""
      },
      {
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        isPublic: true,
        explanation: ""
      },
      {
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        isPublic: false,
        explanation: ""
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be too slow.",
      "So, we need a more efficient way to check if the complement exists in the array."
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(mongoDBURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Drop the collection to clear existing data and indexes
    await mongoose.connection.db.dropCollection('problems').catch(() => {
      console.log('Collection did not exist, creating...');
    });

    // Recreate the collection with the new schema
    const Problem = mongoose.model('Problem');
    
    // Add new problems
    for (const problem of sampleProblems) {
      try {
        await Problem.create(problem);
        console.log(`Added problem: ${problem.title}`);
      } catch (createError) {
        console.error('Error creating problem:', createError.message);
        throw createError;
      }
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();