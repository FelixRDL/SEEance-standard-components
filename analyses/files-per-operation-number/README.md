## Files per Operation Number
Visualize the number of operations commited on each file and by which team member.

Since git does not explicitly track the number of line modifications, it is interpolated using 
insertion and deletion count of a diff hunk within a commit: 
The smaller number of the insertions and deletions of a hunk is taken as modification 
count. The difference is taken as the value for the higher count. 

*Example: a hunk with three insertions and two deletions will output: Two lines modified, zero 
lines deleted and three minus one lines inserted.*

### Aspects worth investigating
- files being extensively modified by multiple members

### Notable Sources
- Liu & Stroulia, 2003