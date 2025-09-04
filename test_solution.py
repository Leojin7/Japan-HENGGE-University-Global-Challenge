import subprocess
import sys

def test_solution():
    # Test input
    test_input = "2\n4\n3 -1 1 10\n5\n9 -5 -5 -10 10"
    
    # Run the solution with the test input
    process = subprocess.Popen(
        [sys.executable, 'solution.py'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Send the input and get the output
    stdout, stderr = process.communicate(input=test_input)
    
    # Expected output
    expected_output = "1\n11250"
    
    # Compare the output
    actual_output = stdout.strip()
    
    print("Test input:")
    print(test_input)
    print("\nExpected output:")
    print(expected_output)
    print("\nActual output:")
    print(actual_output)
    
    if actual_output == expected_output:
        print("\n✅ Test passed!")
    else:
        print("\n❌ Test failed!")
        print("Expected:", repr(expected_output))
        print("Got:     ", repr(actual_output))

if __name__ == "__main__":
    test_solution()
