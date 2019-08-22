# Tank Info Object

Initial information about the tank is passed to `tank.init(function(settings, info) { ... })` of [AI Scripts](./ai_script.md) as a second argument.  For example:

```javascript
  {
    id: 3,
    team: {
      name: 'my-team',
      mates: [2, 3, 4]
    }
  }
```

## Tank Data

Name             |  Description
-----------------|----------------------------------------
**id**           | unique id of the tank

## Team Data

Name               |  Description
-------------------|----------------------------------------
**team**           | team information
**team.name**      | name of the team
**team.mates**     | list of team mates' IDs. Every team mate get it in the same order
