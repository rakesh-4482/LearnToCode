// Single Number
// Difficulty: easy

#include <iostream>
#include <vector>
using namespace std;

int singleNumber(vector<int>& nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;  // XOR all numbers
    }
    return result;
}

int main() {
    vector<int> nums;
    int val;
    
    // Read input until EOF (space-separated numbers)
    while (cin >> val) {
        nums.push_back(val);
    }
    
    // Find and print the single number
    int result = singleNumber(nums);
    cout << result << endl;
    
    return 0;
}