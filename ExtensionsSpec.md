# WCIF Extensions Spec

## Rounds

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

For first rounds, `expectedRegistrations` is the number of people expected to register for a given event at the time of exporting the schedule. By default, it is calculated based on past registration data for the user's region and excludes no-show calculations. For subsequent rounds, it equals the number of people who are expected to advance from the previous round.

## Child Activities

```
{
    id: "competitionScheduler.GroupConfig",
    specUrl: "https://github.com/Rubiks-boy/competition-scheduler/blob/main/ExtensionsSpec.md",
    data: {
        // Number of people we're planning to assign to an activity
        numCompetitors?: number | null | undefined,
    }
}
```

On a per-group basis, we may attach additional information on how many competitors we expect to be in a particular group. This is particular useful for storing information about simultaneous events – if two child activities are supposed to take place at the same time, it'll show how many people should be in each child activity.
