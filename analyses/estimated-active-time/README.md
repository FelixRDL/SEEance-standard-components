## Estimated Active Time
This analysis shows an approximation of the time spent coding on the 
project for each member. Coding time is estimated by an assumed **session
duration** (default: 60 minutes), commits happening within this time 
range will be grouped as a work session.

Since the time working the first commit in a session is not recorded,
it must be emulated by adding an **estimated first commit time** 
(default: 30 minutes).

**CAVEAT** this is a fuzzy metrics and should be only used for 
identifying coarse tendencies. 

### Sensible Preprocessors
- **Unify Authors For Commits**: If some
authors have used multiple aliases, you should de-alias them before analysis.

### Aspects worth investigating
- strong deviations between members' invested coding time
- overall low invested time for all members

### Notable Sources
- Eick et al., 1996
- Algorithm by [kimmobrunfeldt](https://github.com/kimmobrunfeldt/git-hours)