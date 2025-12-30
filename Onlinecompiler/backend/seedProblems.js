import mongoose from 'mongoose';
import { Question } from './models/questionModel.js';
import { mongoDBURL } from './config.js';

const problems = [
    // EASY PROBLEMS (1-20)
    {
        title: "Two Sum",
        author: "ByteSmith",
        problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        topics: ["Array", "Hash Table"],
        difficulty: "easy",
        constraints: `• 2 ≤ nums.length ≤ 10^4
• -10^9 ≤ nums[i] ≤ 10^9
• -10^9 ≤ target ≤ 10^9
• Only one valid answer exists.`,
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
            }
        ],
        publicTestCases: [
            { input: "4\n2 7 11 15\n9", output: "0 1" },
            { input: "3\n3 2 4\n6", output: "1 2" },
            { input: "2\n3 3\n6", output: "0 1" }
        ],
        hiddenTestCases: [
            { input: "5\n1 2 3 4 5\n8", output: "2 4" },
            { input: "4\n-1 -2 -3 -4\n-6", output: "1 3" }
        ]
    },
    {
        title: "Palindrome Number",
        author: "ByteSmith",
        problemStatement: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same backward as forward.`,
        topics: ["Math"],
        difficulty: "easy",
        constraints: `• -2^31 ≤ x ≤ 2^31 - 1`,
        examples: [
            {
                input: "x = 121",
                output: "true",
                explanation: "121 reads as 121 from left to right and from right to left."
            },
            {
                input: "x = -121",
                output: "false",
                explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
            }
        ],
        publicTestCases: [
            { input: "121", output: "true" },
            { input: "-121", output: "false" },
            { input: "10", output: "false" }
        ],
        hiddenTestCases: [
            { input: "0", output: "true" },
            { input: "1221", output: "true" }
        ]
    },
    {
        title: "Valid Parentheses",
        author: "ByteSmith",
        problemStatement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        topics: ["String", "Stack"],
        difficulty: "easy",
        constraints: `• 1 ≤ s.length ≤ 10^4
• s consists of parentheses only '()[]{}'.`,
        examples: [
            {
                input: 's = "()"',
                output: "true",
                explanation: "The string contains valid parentheses."
            },
            {
                input: 's = "()[]{}"',
                output: "true",
                explanation: "All brackets are properly matched."
            },
            {
                input: 's = "(]"',
                output: "false",
                explanation: "Brackets are not properly matched."
            }
        ],
        publicTestCases: [
            { input: "()", output: "true" },
            { input: "()[]{}", output: "true" },
            { input: "(]", output: "false" }
        ],
        hiddenTestCases: [
            { input: "((", output: "false" },
            { input: "{[()]}", output: "true" }
        ]
    },
    {
        title: "Maximum Subarray",
        author: "ByteSmith",
        problemStatement: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
        topics: ["Array", "Dynamic Programming"],
        difficulty: "medium",
        constraints: `• 1 ≤ nums.length ≤ 10^5
• -10^4 ≤ nums[i] ≤ 10^4`,
        examples: [
            {
                input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                output: "6",
                explanation: "The subarray [4,-1,2,1] has the largest sum 6."
            },
            {
                input: "nums = [1]",
                output: "1",
                explanation: "The subarray [1] has the largest sum 1."
            }
        ],
        publicTestCases: [
            { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6" },
            { input: "1\n1", output: "1" },
            { input: "5\n5 4 -1 7 8", output: "23" }
        ],
        hiddenTestCases: [
            { input: "3\n-2 -1 -3", output: "-1" },
            { input: "4\n1 2 3 4", output: "10" }
        ]
    },
    {
        title: "Merge Two Sorted Lists",
        author: "ByteSmith",
        problemStatement: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

For this problem, represent the linked list as an array of integers.`,
        topics: ["Linked List", "Recursion"],
        difficulty: "easy",
        constraints: `• The number of nodes in both lists is in the range [0, 50].
• -100 ≤ Node.val ≤ 100
• Both list1 and list2 are sorted in non-decreasing order.`,
        examples: [
            {
                input: "list1 = [1,2,4], list2 = [1,3,4]",
                output: "[1,1,2,3,4,4]",
                explanation: "Merge the two sorted arrays."
            }
        ],
        publicTestCases: [
            { input: "3\n1 2 4\n3\n1 3 4", output: "1 1 2 3 4 4" },
            { input: "0\n\n1\n0", output: "0" },
            { input: "0\n\n0\n", output: "null" }
        ],
        hiddenTestCases: [
            { input: "2\n1 3\n2\n2 4", output: "1 2 3 4" }
        ]
    }
    // I'll continue with more problems...
];

// Add 45 more problems covering different topics and difficulties
const additionalProblems = [
    {
        title: "Binary Search",
        author: "ByteSmith",
        problemStatement: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
        topics: ["Array", "Binary Search"],
        difficulty: "easy",
        constraints: `• 1 ≤ nums.length ≤ 10^4
• -10^4 < nums[i], target < 10^4
• All the integers in nums are unique.
• nums is sorted in ascending order.`,
        examples: [
            {
                input: "nums = [-1,0,3,5,9,12], target = 9",
                output: "4",
                explanation: "9 exists in nums and its index is 4"
            }
        ],
        publicTestCases: [
            { input: "6\n-1 0 3 5 9 12\n9", output: "4" },
            { input: "6\n-1 0 3 5 9 12\n2", output: "-1" }
        ],
        hiddenTestCases: [
            { input: "1\n5\n5", output: "0" }
        ]
    },
    {
        title: "Reverse Integer",
        author: "ByteSmith",
        problemStatement: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).`,
        topics: ["Math"],
        difficulty: "medium",
        constraints: `• -2^31 ≤ x ≤ 2^31 - 1`,
        examples: [
            {
                input: "x = 123",
                output: "321",
                explanation: "Reverse the digits of 123."
            },
            {
                input: "x = -123",
                output: "-321",
                explanation: "Reverse the digits, keep the sign."
            }
        ],
        publicTestCases: [
            { input: "123", output: "321" },
            { input: "-123", output: "-321" },
            { input: "120", output: "21" }
        ],
        hiddenTestCases: [
            { input: "1534236469", output: "0" }
        ]
    },
    {
        title: "Longest Common Prefix",
        author: "ByteSmith",
        problemStatement: `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".`,
        topics: ["String"],
        difficulty: "easy",
        constraints: `• 1 ≤ strs.length ≤ 200
• 0 ≤ strs[i].length ≤ 200
• strs[i] consists of only lowercase English letters.`,
        examples: [
            {
                input: 'strs = ["flower","flow","flight"]',
                output: '"fl"',
                explanation: "The longest common prefix is 'fl'."
            }
        ],
        publicTestCases: [
            { input: "3\nflower\nflow\nflight", output: "fl" },
            { input: "3\ndog\nracecar\ncar", output: "none" }
        ],
        hiddenTestCases: [
            { input: "1\na", output: "a" }
        ]
    },
    // BATCH 1: Next 10 Problems (Mixed Difficulty)
    {
        title: "Remove Duplicates from Sorted Array",
        author: "ByteSmith",
        problemStatement: `Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.`,
        topics: ["Array", "Two Pointers"],
        difficulty: "easy",
        constraints: `• 1 ≤ nums.length ≤ 3 * 10^4
• -100 ≤ nums[i] ≤ 100
• nums is sorted in non-decreasing order.`,
        examples: [
            {
                input: "nums = [1,1,2]",
                output: "2, nums = [1,2,_]",
                explanation: "Your function should return k = 2, with the first two elements of nums being 1 and 2."
            }
        ],
        publicTestCases: [
            { input: "3\n1 1 2", output: "2" },
            { input: "10\n0 0 1 1 1 2 2 3 3 4", output: "5" }
        ],
        hiddenTestCases: [
            { input: "1\n1", output: "1" }
        ]
    },
    {
        title: "Search Insert Position",
        author: "ByteSmith",
        problemStatement: `Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.`,
        topics: ["Array", "Binary Search"],
        difficulty: "easy",
        constraints: `• 1 ≤ nums.length ≤ 10^4
• -10^4 ≤ nums[i] ≤ 10^4
• nums contains distinct values sorted in ascending order.`,
        examples: [
            {
                input: "nums = [1,3,5,6], target = 5",
                output: "2",
                explanation: "Target 5 is found at index 2."
            }
        ],
        publicTestCases: [
            { input: "4\n1 3 5 6\n5", output: "2" },
            { input: "4\n1 3 5 6\n2", output: "1" },
            { input: "4\n1 3 5 6\n7", output: "4" }
        ],
        hiddenTestCases: [
            { input: "1\n1\n0", output: "0" }
        ]
    },
    {
        title: "Length of Last Word",
        author: "ByteSmith",
        problemStatement: `Given a string s consisting of words and spaces, return the length of the last word in the string. A word is a maximal substring consisting of non-space characters only.`,
        topics: ["String"],
        difficulty: "easy",
        constraints: `• 1 ≤ s.length ≤ 10^4
• s consists of only English letters and spaces ' '.
• There is at least one word in s.`,
        examples: [
            {
                input: 's = "Hello World"',
                output: "5",
                explanation: "The last word is 'World' with length 5."
            }
        ],
        publicTestCases: [
            { input: "Hello World", output: "5" },
            { input: "   fly me   to   the moon  ", output: "4" },
            { input: "luffy is still joyboy", output: "6" }
        ],
        hiddenTestCases: [
            { input: "a", output: "1" }
        ]
    },
    {
        title: "Plus One",
        author: "ByteSmith",
        problemStatement: `You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. Increment the large integer by one and return the resulting array of digits.`,
        topics: ["Array", "Math"],
        difficulty: "easy",
        constraints: `• 1 ≤ digits.length ≤ 100
• 0 ≤ digits[i] ≤ 9
• digits does not contain any leading zeros except for the number 0 itself.`,
        examples: [
            {
                input: "digits = [1,2,3]",
                output: "[1,2,4]",
                explanation: "The array represents the integer 123. Incrementing by one gives 123 + 1 = 124."
            }
        ],
        publicTestCases: [
            { input: "3\n1 2 3", output: "1 2 4" },
            { input: "4\n4 3 2 1", output: "4 3 2 2" },
            { input: "1\n9", output: "1 0" }
        ],
        hiddenTestCases: [
            { input: "2\n9 9", output: "1 0 0" }
        ]
    },
    {
        title: "Sqrt(x)",
        author: "ByteSmith",
        problemStatement: `Given a non-negative integer x, return the square root of x rounded down to the nearest integer. The returned integer should be non-negative as well.`,
        topics: ["Math", "Binary Search"],
        difficulty: "easy",
        constraints: `• 0 ≤ x ≤ 2^31 - 1`,
        examples: [
            {
                input: "x = 4",
                output: "2",
                explanation: "The square root of 4 is 2, so we return 2."
            },
            {
                input: "x = 8",
                output: "2",
                explanation: "The square root of 8 is 2.828..., and since we round it down to the nearest integer, we return 2."
            }
        ],
        publicTestCases: [
            { input: "4", output: "2" },
            { input: "8", output: "2" },
            { input: "0", output: "0" }
        ],
        hiddenTestCases: [
            { input: "1", output: "1" },
            { input: "2147395600", output: "46340" }
        ]
    },
    {
        title: "Best Time to Buy and Sell Stock",
        author: "ByteSmith",
        problemStatement: `You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
        topics: ["Array", "Dynamic Programming"],
        difficulty: "easy",
        constraints: `• 1 ≤ prices.length ≤ 10^5
• 0 ≤ prices[i] ≤ 10^4`,
        examples: [
            {
                input: "prices = [7,1,5,3,6,4]",
                output: "5",
                explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
            }
        ],
        publicTestCases: [
            { input: "6\n7 1 5 3 6 4", output: "5" },
            { input: "5\n7 6 4 3 1", output: "0" }
        ],
        hiddenTestCases: [
            { input: "2\n1 2", output: "1" }
        ]
    },
    {
        title: "Valid Palindrome",
        author: "ByteSmith",
        problemStatement: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.`,
        topics: ["Two Pointers", "String"],
        difficulty: "easy",
        constraints: `• 1 ≤ s.length ≤ 2 * 10^5
• s consists only of printable ASCII characters.`,
        examples: [
            {
                input: 's = "A man, a plan, a canal: Panama"',
                output: "true",
                explanation: '"amanaplanacanalpanama" is a palindrome.'
            }
        ],
        publicTestCases: [
            { input: "A man, a plan, a canal: Panama", output: "true" },
            { input: "race a car", output: "false" }
        ],
        hiddenTestCases: [
            { input: " ", output: "true" }
        ]
    },
    {
        title: "Single Number",
        author: "ByteSmith",
        problemStatement: `Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.`,
        topics: ["Array", "Bit Manipulation"],
        difficulty: "easy",
        constraints: `• 1 ≤ nums.length ≤ 3 * 10^4
• -3 * 10^4 ≤ nums[i] ≤ 3 * 10^4
• Each element in the array appears twice except for one element which appears only once.`,
        examples: [
            {
                input: "nums = [2,2,1]",
                output: "1",
                explanation: "1 appears once, 2 appears twice."
            }
        ],
        publicTestCases: [
            { input: "3\n2 2 1", output: "1" },
            { input: "5\n4 1 2 1 2", output: "4" },
            { input: "1\n1", output: "1" }
        ],
        hiddenTestCases: [
            { input: "7\n1 2 3 2 1 4 4", output: "3" }
        ]
    },
    {
        title: "Linked List Cycle",
        author: "ByteSmith",
        problemStatement: `Given head, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.`,
        topics: ["Hash Table", "Linked List"],
        difficulty: "easy",
        constraints: `• The number of the nodes in the list is in the range [0, 10^4].
• -10^5 ≤ Node.val ≤ 10^5
• pos is -1 or a valid index in the linked-list.`,
        examples: [
            {
                input: "head = [3,2,0,-4], pos = 1",
                output: "true",
                explanation: "There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed)."
            }
        ],
        publicTestCases: [
            { input: "4\n3 2 0 -4\n1", output: "true" },
            { input: "2\n1 2\n0", output: "true" },
            { input: "1\n1\n-1", output: "false" }
        ],
        hiddenTestCases: [
            { input: "0\n-1", output: "false" }
        ]
    },
    {
        title: "Add Two Numbers",
        author: "ByteSmith",
        problemStatement: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list. You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
        topics: ["Linked List", "Math"],
        difficulty: "medium",
        constraints: `• The number of nodes in each linked list is in the range [1, 100].
• 0 ≤ Node.val ≤ 9
• It is guaranteed that the list represents a number that does not have leading zeros.`,
        examples: [
            {
                input: "l1 = [2,4,3], l2 = [5,6,4]",
                output: "[7,0,8]",
                explanation: "342 + 465 = 807."
            }
        ],
        publicTestCases: [
            { input: "3\n2 4 3\n3\n5 6 4", output: "7 0 8" },
            { input: "1\n0\n1\n0", output: "0" },
            { input: "7\n9 9 9 9 9 9 9\n4\n9 9 9 9", output: "8 9 9 9 0 0 0 1" }
        ],
        hiddenTestCases: [
            { input: "2\n2 4\n2\n5 6", output: "7 0 1" }
        ]
    }
];

// BATCH 2: Next 10 Problems (Medium/Hard Focus)
const batch2Problems = [
    {
        title: "Longest Substring Without Repeating Characters",
        author: "ByteSmith",
        problemStatement: `Given a string s, find the length of the longest substring without repeating characters.`,
        topics: ["Hash Table", "String"],
        difficulty: "medium",
        constraints: `• 0 ≤ s.length ≤ 5 * 10^4
• s consists of English letters, digits, symbols and spaces.`,
        examples: [
            {
                input: 's = "abcabcbb"',
                output: "3",
                explanation: 'The answer is "abc", with the length of 3.'
            }
        ],
        publicTestCases: [
            { input: "abcabcbb", output: "3" },
            { input: "bbbbb", output: "1" },
            { input: "pwwkew", output: "3" }
        ],
        hiddenTestCases: [
            { input: "empty", output: "0" },
            { input: "au", output: "2" }
        ]
    },
    {
        title: "Container With Most Water",
        author: "ByteSmith",
        problemStatement: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container that contains the most water.`,
        topics: ["Array", "Two Pointers"],
        difficulty: "medium",
        constraints: `• n == height.length
• 2 ≤ n ≤ 10^5
• 0 ≤ height[i] ≤ 10^4`,
        examples: [
            {
                input: "height = [1,8,6,2,5,4,8,3,7]",
                output: "49",
                explanation: "The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. The max area is 49."
            }
        ],
        publicTestCases: [
            { input: "9\n1 8 6 2 5 4 8 3 7", output: "49" },
            { input: "2\n1 1", output: "1" }
        ],
        hiddenTestCases: [
            { input: "6\n1 2 4 3 4 5", output: "16" }
        ]
    },
    {
        title: "3Sum",
        author: "ByteSmith",
        problemStatement: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.`,
        topics: ["Array", "Two Pointers"],
        difficulty: "medium",
        constraints: `• 3 ≤ nums.length ≤ 3000
• -10^5 ≤ nums[i] ≤ 10^5`,
        examples: [
            {
                input: "nums = [-1,0,1,2,-1,-4]",
                output: "[[-1,-1,2],[-1,0,1]]",
                explanation: "The distinct triplets are [-1,0,1] and [-1,-1,2]."
            }
        ],
        publicTestCases: [
            { input: "6\n-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1" },
            { input: "3\n0 1 1", output: "none" },
            { input: "3\n0 0 0", output: "0 0 0" }
        ],
        hiddenTestCases: [
            { input: "4\n-2 0 1 1", output: "none" }
        ]
    },
    {
        title: "Letter Combinations of a Phone Number",
        author: "ByteSmith",
        problemStatement: `Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.`,
        topics: ["Hash Table", "String"],
        difficulty: "medium",
        constraints: `• 0 ≤ digits.length ≤ 4
• digits[i] is a digit in the range ['2', '9'].`,
        examples: [
            {
                input: 'digits = "23"',
                output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]',
                explanation: "Phone number mapping: 2->abc, 3->def"
            }
        ],
        publicTestCases: [
            { input: "23", output: "ad ae af bd be bf cd ce cf" },
            { input: "empty", output: "none" },
            { input: "2", output: "a b c" }
        ],
        hiddenTestCases: [
            { input: "234", output: "adg adh adi aeg aeh aei afg afh afi bdg bdh bdi beg beh bei bfg bfh bfi cdg cdh cdi ceg ceh cei cfg cfh cfi" }
        ]
    },
    {
        title: "Generate Parentheses",
        author: "ByteSmith",
        problemStatement: `Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.`,
        topics: ["String", "Dynamic Programming"],
        difficulty: "medium",
        constraints: `• 1 ≤ n ≤ 8`,
        examples: [
            {
                input: "n = 3",
                output: '["((()))","(()())","(())()","()(())","()()()"]',
                explanation: "All possible well-formed parentheses with 3 pairs."
            }
        ],
        publicTestCases: [
            { input: "3", output: "((()))\n(()())\n(())()\n()(())\n()()()" },
            { input: "1", output: "()" }
        ],
        hiddenTestCases: [
            { input: "2", output: "(())\n()()" }
        ]
    },
    {
        title: "Valid Sudoku",
        author: "ByteSmith",
        problemStatement: `Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules: Each row must contain the digits 1-9 without repetition, each column must contain the digits 1-9 without repetition, each of the nine 3 x 3 sub-boxes must contain the digits 1-9 without repetition.`,
        topics: ["Array", "Hash Table"],
        difficulty: "medium",
        constraints: `• board.length == 9
• board[i].length == 9
• board[i][j] is a digit 1-9 or '.'.`,
        examples: [
            {
                input: 'board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]',
                output: "true",
                explanation: "Valid Sudoku board."
            }
        ],
        publicTestCases: [
            { input: "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79", output: "true" },
            { input: "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8.179", output: "false" }
        ],
        hiddenTestCases: [
            { input: "123456789456789123789123456234567891567891234891234567345678912678912345912345678", output: "true" }
        ]
    },
    {
        title: "Combination Sum",
        author: "ByteSmith",
        problemStatement: `Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order. The same number may be chosen from candidates an unlimited number of times.`,
        topics: ["Array", "Backtracking"],
        difficulty: "medium",
        constraints: `• 1 ≤ candidates.length ≤ 30
• 2 ≤ candidates[i] ≤ 40
• All elements of candidates are distinct.
• 1 ≤ target ≤ 40`,
        examples: [
            {
                input: "candidates = [2,3,6,7], target = 7",
                output: "[[2,2,3],[7]]",
                explanation: "2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times. 7 is a candidate, and 7 = 7."
            }
        ],
        publicTestCases: [
            { input: "4\n2 3 6 7\n7", output: "2 2 3\n7" },
            { input: "3\n2 3 5\n8", output: "2 2 2 2\n2 3 3\n3 5" }
        ],
        hiddenTestCases: [
            { input: "1\n1\n2", output: "1 1" }
        ]
    },
    {
        title: "Permutations",
        author: "ByteSmith",
        problemStatement: `Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.`,
        topics: ["Array", "Backtracking"],
        difficulty: "medium",
        constraints: `• 1 ≤ nums.length ≤ 6
• -10 ≤ nums[i] ≤ 10
• All the integers of nums are unique.`,
        examples: [
            {
                input: "nums = [1,2,3]",
                output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
                explanation: "All possible permutations of [1,2,3]."
            }
        ],
        publicTestCases: [
            { input: "3\n1 2 3", output: "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1" },
            { input: "2\n0 1", output: "0 1\n1 0" },
            { input: "1\n1", output: "1" }
        ],
        hiddenTestCases: [
            { input: "4\n1 2 3 4", output: "1 2 3 4\n1 2 4 3\n1 3 2 4\n1 3 4 2\n1 4 2 3\n1 4 3 2\n2 1 3 4\n2 1 4 3\n2 3 1 4\n2 3 4 1\n2 4 1 3\n2 4 3 1\n3 1 2 4\n3 1 4 2\n3 2 1 4\n3 2 4 1\n3 4 1 2\n3 4 2 1\n4 1 2 3\n4 1 3 2\n4 2 1 3\n4 2 3 1\n4 3 1 2\n4 3 2 1" }
        ]
    },
    {
        title: "Group Anagrams",
        author: "ByteSmith",
        problemStatement: `Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
        topics: ["Array", "Hash Table"],
        difficulty: "medium",
        constraints: `• 1 ≤ strs.length ≤ 10^4
• 0 ≤ strs[i].length ≤ 100
• strs[i] consists of only lowercase English letters.`,
        examples: [
            {
                input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
                output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
                explanation: "Group words that are anagrams of each other."
            }
        ],
        publicTestCases: [
            { input: "6\neat\ntea\ntan\nate\nnat\nbat", output: "bat\nnat tan\nate eat tea" },
            { input: "1\na", output: "a" }
        ],
        hiddenTestCases: [
            { input: "2\nab\nba", output: "ab ba" }
        ]
    },
    {
        title: "Maximum Depth of Binary Tree",
        author: "ByteSmith",
        problemStatement: `Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
        topics: ["Tree", "Binary Tree"],
        difficulty: "easy",
        constraints: `• The number of nodes in the tree is in the range [0, 10^4].
• -100 ≤ Node.val ≤ 100`,
        examples: [
            {
                input: "root = [3,9,20,null,null,15,7]",
                output: "3",
                explanation: "The maximum depth is 3."
            }
        ],
        publicTestCases: [
            { input: "7\n3 9 20 -1 -1 15 7", output: "3" },
            { input: "2\n1 -1 2", output: "2" }
        ],
        hiddenTestCases: [
            { input: "0", output: "0" },
            { input: "1\n1", output: "1" }
        ]
    }
];

// BATCH 3: Final 22 Problems (Complete the 50-problem set)
const batch3Problems = [
    {
        title: "Median of Two Sorted Arrays",
        author: "ByteSmith",
        problemStatement: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).`,
        topics: ["Array", "Binary Search"],
        difficulty: "hard",
        constraints: `• nums1.length == m
• nums2.length == n
• 0 ≤ m ≤ 1000
• 0 ≤ n ≤ 1000
• 1 ≤ m + n ≤ 2000
• -10^6 ≤ nums1[i], nums2[i] ≤ 10^6`,
        examples: [
            {
                input: "nums1 = [1,3], nums2 = [2]",
                output: "2.00000",
                explanation: "merged array = [1,2,3] and median is 2."
            }
        ],
        publicTestCases: [
            { input: "2\n1 3\n1\n2", output: "2.0" },
            { input: "2\n1 2\n2\n3 4", output: "2.5" }
        ],
        hiddenTestCases: [
            { input: "0\n2\n1 2", output: "1.5" }
        ]
    },
    {
        title: "Regular Expression Matching",
        author: "ByteSmith",
        problemStatement: `Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where: '.' Matches any single character. '*' Matches zero or more of the preceding element. The matching should cover the entire input string (not partial).`,
        topics: ["String", "Dynamic Programming"],
        difficulty: "hard",
        constraints: `• 1 ≤ s.length ≤ 20
• 1 ≤ p.length ≤ 30
• s contains only lowercase English letters.
• p contains only lowercase English letters, '.', and '*'.`,
        examples: [
            {
                input: 's = "aa", p = "a"',
                output: "false",
                explanation: '"a" does not match the entire string "aa".'
            }
        ],
        publicTestCases: [
            { input: "aa\na", output: "false" },
            { input: "aa\na*", output: "true" },
            { input: "ab\n.*", output: "true" }
        ],
        hiddenTestCases: [
            { input: "aab\nc*a*b", output: "true" }
        ]
    },
    {
        title: "Trapping Rain Water",
        author: "ByteSmith",
        problemStatement: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
        topics: ["Array", "Two Pointers"],
        difficulty: "hard",
        constraints: `• n == height.length
• 1 ≤ n ≤ 2 * 10^4
• 0 ≤ height[i] ≤ 3 * 10^4`,
        examples: [
            {
                input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                output: "6",
                explanation: "The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped."
            }
        ],
        publicTestCases: [
            { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" },
            { input: "6\n4 2 0 3 2 5", output: "9" }
        ],
        hiddenTestCases: [
            { input: "1\n0", output: "0" }
        ]
    },
    {
        title: "N-Queens",
        author: "ByteSmith",
        problemStatement: `The n-queens puzzle is the problem of placing n queens on an n×n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.`,
        topics: ["Array", "Backtracking"],
        difficulty: "hard",
        constraints: `• 1 ≤ n ≤ 9`,
        examples: [
            {
                input: "n = 4",
                output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
                explanation: "There exist two distinct solutions to the 4-queens puzzle."
            }
        ],
        publicTestCases: [
            { input: "4", output: ".Q..\n...Q\nQ...\n..Q.\n\n..Q.\nQ...\n...Q\n.Q.." },
            { input: "1", output: "Q" }
        ],
        hiddenTestCases: [
            { input: "8", output: "92solutions" }
        ]
    },
    {
        title: "Word Ladder",
        author: "ByteSmith",
        problemStatement: `A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that: Every adjacent pair of words differs by a single letter. Return the length of the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.`,
        topics: ["Hash Table", "String", "BFS"],
        difficulty: "hard",
        constraints: `• 1 ≤ beginWord.length ≤ 10
• endWord.length == beginWord.length
• 1 ≤ wordList.length ≤ 5000
• wordList[i].length == beginWord.length
• beginWord, endWord, and wordList[i] consist of lowercase English letters.`,
        examples: [
            {
                input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
                output: "5",
                explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.'
            }
        ],
        publicTestCases: [
            { input: "hit\ncog\n6\nhot\ndot\ndog\nlot\nlog\ncog", output: "5" },
            { input: "hit\ncog\n5\nhot\ndot\ndog\nlot\nlog", output: "0" }
        ],
        hiddenTestCases: [
            { input: "a\nc\n2\na\nb", output: "0" }
        ]
    },
    {
        title: "Merge k Sorted Lists",
        author: "ByteSmith",
        problemStatement: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.`,
        topics: ["Linked List", "Divide and Conquer"],
        difficulty: "hard",
        constraints: `• k == lists.length
• 0 ≤ k ≤ 10^4
• 0 ≤ lists[i].length ≤ 500
• -10^4 ≤ lists[i][j] ≤ 10^4
• lists[i] is sorted in ascending order.`,
        examples: [
            {
                input: "lists = [[1,4,5],[1,3,4],[2,6]]",
                output: "[1,1,2,3,4,4,5,6]",
                explanation: "The linked-lists are merged into one sorted list."
            }
        ],
        publicTestCases: [
            { input: "3\n3\n1 4 5\n3\n1 3 4\n2\n2 6", output: "1 1 2 3 4 4 5 6" },
            { input: "0", output: "empty" }
        ],
        hiddenTestCases: [
            { input: "1\n0", output: "empty" }
        ]
    },
    {
        title: "Longest Valid Parentheses",
        author: "ByteSmith",
        problemStatement: `Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.`,
        topics: ["String", "Dynamic Programming"],
        difficulty: "hard",
        constraints: `• 0 ≤ s.length ≤ 3 * 10^4
• s[i] is '(', or ')'.`,
        examples: [
            {
                input: 's = "(()"',
                output: "2",
                explanation: "The longest valid parentheses substring is \"()\"."
            }
        ],
        publicTestCases: [
            { input: "(()", output: "2" },
            { input: ")()())", output: "4" },
            { input: "empty", output: "0" }
        ],
        hiddenTestCases: [
            { input: "((()))", output: "6" }
        ]
    },
    {
        title: "Edit Distance",
        author: "ByteSmith",
        problemStatement: `Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have the following three operations permitted on a word: Insert a character, Delete a character, Replace a character.`,
        topics: ["String", "Dynamic Programming"],
        difficulty: "hard",
        constraints: `• 0 ≤ word1.length, word2.length ≤ 500
• word1 and word2 consist of lowercase English letters only.`,
        examples: [
            {
                input: 'word1 = "horse", word2 = "ros"',
                output: "3",
                explanation: "horse -> rorse (replace 'h' with 'r'), rorse -> rose (remove 'r'), rose -> ros (remove 'e')"
            }
        ],
        publicTestCases: [
            { input: "horse\nros", output: "3" },
            { input: "intention\nexecution", output: "5" }
        ],
        hiddenTestCases: [
            { input: "abc\nabc", output: "0" }
        ]
    },
    {
        title: "Climbing Stairs",
        author: "ByteSmith",
        problemStatement: `You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
        topics: ["Math", "Dynamic Programming"],
        difficulty: "easy",
        constraints: `• 1 ≤ n ≤ 45`,
        examples: [
            {
                input: "n = 2",
                output: "2",
                explanation: "There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps"
            }
        ],
        publicTestCases: [
            { input: "2", output: "2" },
            { input: "3", output: "3" }
        ],
        hiddenTestCases: [
            { input: "5", output: "8" }
        ]
    },
    {
        title: "Unique Paths",
        author: "ByteSmith",
        problemStatement: `There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time. Given the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.`,
        topics: ["Math", "Dynamic Programming"],
        difficulty: "medium",
        constraints: `• 1 ≤ m, n ≤ 100`,
        examples: [
            {
                input: "m = 3, n = 7",
                output: "28",
                explanation: "There are 28 unique paths from top-left to bottom-right."
            }
        ],
        publicTestCases: [
            { input: "3\n7", output: "28" },
            { input: "3\n2", output: "3" }
        ],
        hiddenTestCases: [
            { input: "1\n1", output: "1" }
        ]
    },
    {
        title: "Minimum Path Sum",
        author: "ByteSmith",
        problemStatement: `Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path. Note: You can only move either down or right at any point in time.`,
        topics: ["Array", "Dynamic Programming"],
        difficulty: "medium",
        constraints: `• m == grid.length
• n == grid[i].length
• 1 ≤ m, n ≤ 200
• 0 ≤ grid[i][j] ≤ 100`,
        examples: [
            {
                input: "grid = [[1,3,1],[1,5,1],[4,2,1]]",
                output: "7",
                explanation: "Because the path 1 → 3 → 1 → 1 → 1 minimizes the sum."
            }
        ],
        publicTestCases: [
            { input: "3\n3\n1 3 1\n1 5 1\n4 2 1", output: "7" },
            { input: "2\n3\n1 2 3\n4 5 6", output: "12" }
        ],
        hiddenTestCases: [
            { input: "1\n1\n1", output: "1" }
        ]
    },
    {
        title: "Decode Ways",
        author: "ByteSmith",
        problemStatement: `A message containing letters from A-Z can be encoded into numbers using the following mapping: 'A' -> "1", 'B' -> "2", ..., 'Z' -> "26". To decode an encoded message, all the digits must be grouped then mapped back into letters using the reverse of the mapping above. Given a string s containing only digits, return the number of ways to decode it.`,
        topics: ["String", "Dynamic Programming"],
        difficulty: "medium",
        constraints: `• 1 ≤ s.length ≤ 100
• s contains only digits and may contain leading zero(s).`,
        examples: [
            {
                input: 's = "12"',
                output: "2",
                explanation: '"12" could be decoded as "AB" (1 2) or "L" (12).'
            }
        ],
        publicTestCases: [
            { input: "12", output: "2" },
            { input: "226", output: "3" },
            { input: "06", output: "0" }
        ],
        hiddenTestCases: [
            { input: "10", output: "1" }
        ]
    },
    {
        title: "Binary Tree Inorder Traversal",
        author: "ByteSmith",
        problemStatement: `Given the root of a binary tree, return the inorder traversal of its nodes' values.`,
        topics: ["Stack", "Tree", "Binary Tree"],
        difficulty: "easy",
        constraints: `• The number of nodes in the tree is in the range [0, 100].
• -100 ≤ Node.val ≤ 100`,
        examples: [
            {
                input: "root = [1,null,2,3]",
                output: "[1,3,2]",
                explanation: "Inorder traversal: left, root, right"
            }
        ],
        publicTestCases: [
            { input: "3\n1 -1 2 3", output: "1 3 2" },
            { input: "0", output: "empty" },
            { input: "1\n1", output: "1" }
        ],
        hiddenTestCases: [
            { input: "5\n1 2 3 4 5", output: "4 2 5 1 3" }
        ]
    },
    {
        title: "Validate Binary Search Tree",
        author: "ByteSmith",
        problemStatement: `Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: The left subtree of a node contains only nodes with keys less than the node's key. The right subtree of a node contains only nodes with keys greater than the node's key. Both the left and right subtrees must also be binary search trees.`,
        topics: ["Tree", "Binary Search Tree"],
        difficulty: "medium",
        constraints: `• The number of nodes in the tree is in the range [1, 10^4].
• -2^31 ≤ Node.val ≤ 2^31 - 1`,
        examples: [
            {
                input: "root = [2,1,3]",
                output: "true",
                explanation: "This is a valid BST."
            }
        ],
        publicTestCases: [
            { input: "3\n2 1 3", output: "true" },
            { input: "5\n5 1 4 -1 -1 3 6", output: "false" }
        ],
        hiddenTestCases: [
            { input: "1\n1", output: "true" }
        ]
    },
    {
        title: "Symmetric Tree",
        author: "ByteSmith",
        problemStatement: `Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).`,
        topics: ["Tree", "Binary Tree"],
        difficulty: "easy",
        constraints: `• The number of nodes in the tree is in the range [1, 1000].
• -100 ≤ Node.val ≤ 100`,
        examples: [
            {
                input: "root = [1,2,2,3,4,4,3]",
                output: "true",
                explanation: "The tree is symmetric."
            }
        ],
        publicTestCases: [
            { input: "7\n1 2 2 3 4 4 3", output: "true" },
            { input: "3\n1 2 2", output: "true" }
        ],
        hiddenTestCases: [
            { input: "3\n1 2 3", output: "false" }
        ]
    },
    {
        title: "Binary Tree Level Order Traversal",
        author: "ByteSmith",
        problemStatement: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
        topics: ["Tree", "Binary Tree", "BFS"],
        difficulty: "medium",
        constraints: `• The number of nodes in the tree is in the range [0, 2000].
• -1000 ≤ Node.val ≤ 1000`,
        examples: [
            {
                input: "root = [3,9,20,null,null,15,7]",
                output: "[[3],[9,20],[15,7]]",
                explanation: "Level order traversal of the tree."
            }
        ],
        publicTestCases: [
            { input: "7\n3 9 20 -1 -1 15 7", output: "3\n9 20\n15 7" },
            { input: "1\n1", output: "1" }
        ],
        hiddenTestCases: [
            { input: "0", output: "empty" }
        ]
    },
    {
        title: "Convert Sorted Array to Binary Search Tree",
        author: "ByteSmith",
        problemStatement: `Given an integer array nums where the elements are sorted in ascending order, convert it to a height-balanced binary search tree.`,
        topics: ["Array", "Divide and Conquer", "Tree"],
        difficulty: "easy",
        constraints: `• 1 ≤ nums.length ≤ 10^4
• -10^4 ≤ nums[i] ≤ 10^4
• nums is sorted in a strictly increasing order.`,
        examples: [
            {
                input: "nums = [-10,-3,0,5,9]",
                output: "[0,-3,9,-10,null,5]",
                explanation: "One possible answer is [0,-3,9,-10,null,5], which represents a height-balanced BST."
            }
        ],
        publicTestCases: [
            { input: "5\n-10 -3 0 5 9", output: "0 -3 9 -10 5" },
            { input: "1\n1", output: "1" }
        ],
        hiddenTestCases: [
            { input: "3\n1 2 3", output: "2 1 3" }
        ]
    },
    {
        title: "Path Sum",
        author: "ByteSmith",
        problemStatement: `Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path such that adding up all the values along the path equals targetSum.`,
        topics: ["Tree", "Binary Tree"],
        difficulty: "easy",
        constraints: `• The number of nodes in the tree is in the range [0, 5000].
• -1000 ≤ Node.val ≤ 1000
• -1000 ≤ targetSum ≤ 1000`,
        examples: [
            {
                input: "root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22",
                output: "true",
                explanation: "The root-to-leaf path with the target sum is shown."
            }
        ],
        publicTestCases: [
            { input: "13\n5 4 8 11 -1 13 4 7 2 -1 -1 -1 1\n22", output: "true" },
            { input: "3\n1 2 3\n5", output: "false" }
        ],
        hiddenTestCases: [
            { input: "0\n0", output: "false" }
        ]
    },
    {
        title: "Flatten Binary Tree to Linked List",
        author: "ByteSmith",
        problemStatement: `Given the root of a binary tree, flatten the tree into a "linked list": The "linked list" should use the same TreeNode class where the right child pointer points to the next node in the list and the left child pointer is always null. The "linked list" should be in the same order as a pre-order traversal of the binary tree.`,
        topics: ["Linked List", "Stack", "Tree"],
        difficulty: "medium",
        constraints: `• The number of nodes in the tree is in the range [0, 2000].
• -100 ≤ Node.val ≤ 100`,
        examples: [
            {
                input: "root = [1,2,5,3,4,null,6]",
                output: "[1,null,2,null,3,null,4,null,5,null,6]",
                explanation: "Flatten the tree to a linked list in pre-order."
            }
        ],
        publicTestCases: [
            { input: "6\n1 2 5 3 4 -1 6", output: "1 2 3 4 5 6" },
            { input: "0", output: "empty" }
        ],
        hiddenTestCases: [
            { input: "1\n1", output: "1" }
        ]
    },
    {
        title: "Best Time to Buy and Sell Stock II",
        author: "ByteSmith",
        problemStatement: `You are given an array prices where prices[i] is the price of a given stock on the ith day. On each day, you may decide to buy and/or sell the stock. You can only hold at most one share of the stock at any time. However, you can buy it then immediately sell it on the same day. Find and return the maximum profit you can achieve.`,
        topics: ["Array", "Dynamic Programming"],
        difficulty: "medium",
        constraints: `• 1 ≤ prices.length ≤ 3 * 10^4
• 0 ≤ prices[i] ≤ 10^4`,
        examples: [
            {
                input: "prices = [7,1,5,3,6,4]",
                output: "7",
                explanation: "Buy on day 2 (price = 1) and sell on day 3 (price = 5), profit = 5-1 = 4. Then buy on day 4 (price = 3) and sell on day 5 (price = 6), profit = 6-3 = 3. Total profit is 4 + 3 = 7."
            }
        ],
        publicTestCases: [
            { input: "6\n7 1 5 3 6 4", output: "7" },
            { input: "5\n1 2 3 4 5", output: "4" },
            { input: "5\n7 6 4 3 1", output: "0" }
        ],
        hiddenTestCases: [
            { input: "2\n1 2", output: "1" }
        ]
    },
    {
        title: "Pascal's Triangle",
        author: "ByteSmith",
        problemStatement: `Given an integer numRows, return the first numRows of Pascal's triangle. In Pascal's triangle, each number is the sum of the two numbers directly above it.`,
        topics: ["Array", "Dynamic Programming"],
        difficulty: "easy",
        constraints: `• 1 ≤ numRows ≤ 30`,
        examples: [
            {
                input: "numRows = 5",
                output: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]",
                explanation: "Pascal's triangle with 5 rows."
            }
        ],
        publicTestCases: [
            { input: "5", output: "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1" },
            { input: "1", output: "1" }
        ],
        hiddenTestCases: [
            { input: "3", output: "1\n1 1\n1 2 1" }
        ]
    },
    {
        title: "Triangle",
        author: "ByteSmith",
        problemStatement: `Given a triangle array, return the minimum path sum from top to bottom. For each step, you may move to an adjacent number of the row below. More formally, if you are on index i on the current row, you may move to either index i or index i + 1 on the next row.`,
        topics: ["Array", "Dynamic Programming"],
        difficulty: "medium",
        constraints: `• 1 ≤ triangle.length ≤ 200
• triangle[0].length == 1
• triangle[i].length == triangle[i - 1].length + 1
• -10^4 ≤ triangle[i][j] ≤ 10^4`,
        examples: [
            {
                input: "triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]",
                output: "11",
                explanation: "The triangle looks like: 2, 3 4, 6 5 7, 4 1 8 3. The minimum path sum from top to bottom is 2 + 3 + 5 + 1 = 11."
            }
        ],
        publicTestCases: [
            { input: "4\n1\n2\n2\n3 4\n3\n6 5 7\n4\n4 1 8 3", output: "11" },
            { input: "1\n1\n-10", output: "-10" }
        ],
        hiddenTestCases: [
            { input: "2\n1\n1\n2\n2 3", output: "3" }
        ]
    }
];

// Combine all problems
const allProblems = [...problems, ...additionalProblems, ...batch2Problems, ...batch3Problems];

const seedProblems = async () => {
    try {
        console.log('🌱 Starting to seed problems...');
        
        // Connect to MongoDB
        await mongoose.connect(mongoDBURL);
        console.log('✅ Connected to MongoDB');
        
        // Clear existing questions
        await Question.deleteMany({});
        console.log('🗑️  Cleared existing questions');
        
        // Insert new problems
        const insertedProblems = await Question.insertMany(allProblems);
        console.log(`✅ Successfully inserted ${insertedProblems.length} problems`);
        
        // Display summary
        const summary = {};
        insertedProblems.forEach(problem => {
            summary[problem.difficulty] = (summary[problem.difficulty] || 0) + 1;
        });
        
        console.log('📊 Problems by difficulty:');
        Object.entries(summary).forEach(([difficulty, count]) => {
            console.log(`   ${difficulty}: ${count} problems`);
        });
        
        console.log('🎉 Problem seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding problems:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
};

// Run the seeding function
seedProblems();
