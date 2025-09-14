def main():
    import sys
    
    
    data = []
    for line in sys.stdin:
        line = line.strip()
        if line:  # Only process non-empty lines
            data.append(line)
    
    if not data:
        return
    
    try:
        
        n = int(data[0])
        if n < 1 or n > 100:
            print(-1)
            return
            
        results = []
        idx = 1  
        
        for _ in range(n):
            if idx >= len(data):
                results.append(-1)
                break
                
            
            try:
                x = int(data[idx])
            except ValueError:
                results.append(-1)
                idx += 1
                continue
                
            idx += 1
            
            # Check if we have the numbers line
            if idx >= len(data):
                results.append(-1)
                break
                
           
            try:
                numbers = list(map(int, data[idx].split()))
            except ValueError:
                results.append(-1)
                idx += 1
                continue
                
            # Check if count matches
            if len(numbers) != x:
                results.append(-1)
                idx += 1
                continue
                
            # Calculate sum of fourth powers of non-positive numbers
            total = 0
            for num in numbers:
                if num <= 0:
                    total += num ** 4
                    
            results.append(total)
            idx += 1
        
        # Print all results
        for result in results:
            print(result)
            
    except Exception:
        print(-1)

if __name__ == "__main__":
    main()
