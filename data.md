```javascript
Templates:
  User template:
    user {
      'uId': int,
      'nameFirst': string,
      'nameLast': string,
      'email': string,
      'handleStr': string,
      'password': string,
    }
  Channel template:
    channel {
      'cId': int, 
      'cName': string,
      'members': int array,
      'ownerId': int,
      'isPublic': boolean,
      'start': int,
      'message': string,
    }

Examples:
  User example:
    user {
      'uId': 1,
      'nameFirst': 'Hayden',
      'nameLast': 'Smith',
      'email': 'hayhay123@gmail.com',
      'handleStr': 'haydensmith',
      'password': 'comp1531',
    }

Channel example:
    channel {
      'cId': 1, 
      'cName': 'COMP1531',
      'members': [1,2,3,4],
      'ownerId': 7,
      'isPublic': true,
      'start': 2,
      'message': 'Hello world!',
    }
```
