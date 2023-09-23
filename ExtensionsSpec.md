# WCIF Extensions Spec

## Round

```
{
    id: "competitionScheduler.RoundConfig",
    specUrl: "https://github.com/Rubiks-boy/competition-scheduler/blob/main/ExtensionsSpec.md",
    data: {
        // Expected number of people in a round
        expectedRegistrations?: number | null | undefined,
        // Number of groups used when making the schedule
        groupCount?: number | null | undefined,
    }
}
```

For first rounds, `expectedRegistrations` is the number of people expected to register for a given event at the time of exporting the schedule. By default, it is calculated based on past registration data for the user's region and excludes no-show calculations. For subsequent rounds, it equals the number of people who advance from the previous round.
