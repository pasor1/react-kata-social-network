import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const usersAllowed = [
    { name: 'Alice', follows: [] },
    { name: 'Bob', follows: [] },
    { name: 'Charlie', follows: [] }];
  const [users, setUsers] = useState(usersAllowed);
  const [command, setCommand] = useState('');
  const [posts, setPosts] = useState([]);
  const [log, setLog] = useState([{
    type: 'command',
    entry: `Welcome to Kata Social Network`
  }]);

  // initial focus on blinking prompt
  const commandInput = useRef(null);
  useEffect(() => {
    commandInput.current.focus();
  }, []);

  function handleEnter(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      // append command to log
      const newLogLine = [{ entry: `> ${command}` }];
      setLog(prevLog => [...prevLog, ...newLogLine]);

      if (command.includes(' -> ')) { // posting
        post(command);
      } else if (command.includes(' follows ')) { // following
        follow(command)
      } else if (command.includes(' wall')) { // wall
        wall(command)
      } else if (users.some(user => user.name === command)) { // read
        read(command)
      }
      // prompt clear
      setCommand('');
    }
  }

  function post(command) {
    const [name, content] = command.split(/ -> (.+)/);
    if (users.some(user => user.name === name)) {
      setPosts(prevPosts => [{ name, content, time: new Date() }, ...prevPosts]);
    } else {
      const error = {
        type: 'error',
        entry: `> ${name} cannot posts.`
      };
      // append error to log
      setLog(prevLog => [...prevLog, error])
    }
  }

  function follow(command) {
    const [name, target] = command.split(/ follows (.+)/);
    if (
      name !== target
      && users.some(user => user.name === name)
      && users.some(user => user.name === target)
    ) {
      const updatedUsers = users.map(user => {
        if (user.name === name && !user.follows.includes(target)) {
          return { name: user.name, follows: [...user.follows, target] }
        }
        return user
      });
      setUsers(updatedUsers);
    } else {
      const error = {
        type: 'error',
        entry: `> ${name} or ${target} doesn't exists.`
      };
      // append error to log
      setLog(prevLog => [...prevLog, error])
    }
  }

  function read(user) {
    const newLogLines = [];
    posts.forEach(post => {
      if (post.name === user) {
        newLogLines.push({
          type: 'post',
          entry: `> ${post.content} (${getReadableTimeDiff(post.time, new Date())})`
        })
      }
    })
    if (newLogLines.length) {
      // append results to log
      setLog(prevLog => [...prevLog, ...newLogLines])
    } else { // error, no posts
      const error = {
        type: 'error',
        entry: `> ${user} has no posts`
      };
      // append error to log
      setLog(prevLog => [...prevLog, error])
    }
  }

  function wall(command) {
    const [userName] = command.split(' ');
    const follows = users.filter(user => user.name === userName)[0].follows;
    const newLogLines = [];
    posts.forEach(post => {
      if (post.name === userName
        || follows.includes(post.name)
      ) {
        newLogLines.push({
          type: 'post',
          entry: `> ${post.name} - ${post.content} (${getReadableTimeDiff(post.time)})`
        })
      }
    })
    if (newLogLines.length) {
      // append results to log
      setLog(prevLog => [...prevLog, ...newLogLines])
    } else { // error, no posts
      const error = {
        type: 'error',
        entry: `> No posts`
      };
      // append error to log
      setLog(prevLog => [...prevLog, error])
    }
  }

  function getReadableTimeDiff(time) {
    const timeDiff = Math.round((new Date() - time) / 1000);
    const seconds = timeDiff % 60;
    const minutes = Math.floor(timeDiff / 60);
    const hours = Math.floor(timeDiff / 60 / 60);
    if (hours === 1) {
      return `${hours} hour ago`
    } else if (hours > 1) {
      return `${hours} hours ago`
    } else if (minutes === 1) {
      return `${minutes} minute ago`
    } else if (minutes > 1) {
      return `${minutes} minutes ago`
    } else if (seconds === 1) {
      return `${seconds} second ago`
    } else if (seconds > 1) {
      return `${seconds} seconds ago`
    }
  }

  const showLogs = log.map(logLine => {
    return (
      <div className={`line ${logLine.type}`} key={Math.random().toString()}>
        {logLine.entry}
      </div>
    )
  })

  return (
    <div className="App">
      {showLogs}
      <div className="line">
        <div className="line-pre">&gt; </div>
        <textarea
          className="commandInput line-content"
          ref={commandInput}
          value={command}
          onChange={event => setCommand(event.target.value)}
          onKeyDown={handleEnter} />
      </div>
    </div >
  );
}

export default App;
