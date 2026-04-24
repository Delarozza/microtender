import sys
with open('test/MicroTender.test.js', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # skip "Tender Publishing" describe block entirely
    if 'describe("Tender Publishing"' in line:
        skip = 'describe'
        continue
    if skip == 'describe' and 'describe("Vendor Registration"' in line:
        skip = False
    if skip == 'describe':
        continue
        
    # skip "Should not allow bid on draft tender" block entirely
    if 'it("Should not allow bid on draft tender"' in line:
        skip = 'it'
        continue
    if skip == 'it' and 'it("Should not allow bid exceeding max budget"' in line:
        skip = False
    if skip == 'it':
        continue

    # remove publishTender calls
    if 'publishTender' in line:
        continue

    # modify createTender arguments
    if line.strip() == 'ipfsCID' and 'createTender' in "".join(lines[i-6:i]):
        line = line.replace('ipfsCID', 'ipfsCID,\n          7')
    elif line.strip() == '""' and 'createTender' in "".join(lines[i-6:i]):
        line = line.replace('""', '"",\n        7')
        
    # fix status checks
    if '.to.equal(0); // Draft' in line:
        line = line.replace('.to.equal(0); // Draft', '.to.equal(0); // Open')
    elif '.to.equal(1); // Open' in line:
        line = line.replace('.to.equal(1); // Open', '.to.equal(0); // Open')
    elif '.to.equal(2); // Voting' in line:
        line = line.replace('.to.equal(2); // Voting', '.to.equal(1); // Voting')
    elif '.to.equal(3); // Completed' in line:
        line = line.replace('.to.equal(3); // Completed', '.to.equal(2); // Completed')
    elif '.to.equal(4); // Fulfilled' in line:
        line = line.replace('.to.equal(4); // Fulfilled', '.to.equal(3); // Fulfilled')
    elif '.to.equal(5); // Cancelled' in line:
        line = line.replace('.to.equal(5); // Cancelled', '.to.equal(4); // Cancelled')
        
    if 'status: 1' in line:
        line = line.replace('status: 1', 'status: 0')
    if 'status).to.equal(1)' in line and 'Open' not in line and 'Voting' not in line:
        line = line.replace('status).to.equal(1)', 'status).to.equal(0)')
    if 'status).to.equal(2)' in line and 'Voting' not in line and 'Completed' not in line:
        line = line.replace('status).to.equal(2)', 'status).to.equal(1)')
    if 'status).to.equal(3)' in line and 'Completed' not in line and 'Fulfilled' not in line:
        line = line.replace('status).to.equal(3)', 'status).to.equal(2)')

    new_lines.append(line)

with open('test/MicroTender.test.js', 'w') as f:
    f.writelines(new_lines)
