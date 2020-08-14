## Files per Operation Number
Visualize the number of operations commited on each file.

Since git does not explicitly track the number of line modifications, it is interpolated using 
insertion and deletion count of a diff hunk within a commit: 
The smaller number of the insertions and deletions of a hunk is taken as modification 
count. The difference is taken as the value for the higher count. 

*Example: a hunk with three insertions and two deletions will output: Two lines modified, zero 
lines deleted and three minus one lines inserted.*

### Sensible Preprocessors
None

### Aspects worth investigating
- files being never modified
- files being extensively modified
- files with high LOC count

### Notable Sources
- Liu, 2003