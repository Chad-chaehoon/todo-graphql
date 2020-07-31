import React, { useState, useEffect } from "react";
// import logo from "./logo.svg";
import "./App.css";

import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { graphqlMutation } from "aws-appsync-react";
import { buildSubscription } from "aws-appsync";

const SubscribeToTodos = gql`
  subscription onCreateTodo {
    onCreateTodo {
      id
      title
      completed
    }
  }
`;

const CreateTodo = gql`
  mutation($title: String!, $completed: Boolean) {
    createTodo(input: { title: $title, completed: $completed }) {
      id
      title
      completed
    }
  }
`;

const ListTodos = gql`
  query {
    listTodos {
      items {
        id
        title
        completed
      }
    }
  }
`;

function App(props) {
  const { todos, createTodo, data } = props;
  const [todo, setTodo] = useState("");

  useEffect(() => {
    data.subscribeToMore(buildSubscription(SubscribeToTodos, ListTodos));
  }, [data]);

  const addTodo = () => {
    if (todo === "") return;
    const oneTodo = {
      title: todo,
      completed: false,
    };
    createTodo(oneTodo);
    setTodo("");
  };
  console.log(props.data);
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header> */}
      <input
        onChange={(e) => setTodo(e.target.value)}
        value={todo}
        placeholder="Todo name"
      />
      <button onClick={addTodo}>Add Todo</button>
      <p className="App-intro">
        To get started, edit <code>src/App.js</code> and save to reload.
      </p>
      {todos.map((item, i) => (
        <p key={i}>{item.title}</p>
      ))}
    </div>
  );
}

export default compose(
  graphqlMutation(CreateTodo, ListTodos, "Todo"),
  graphql(ListTodos, {
    options: {
      fetchPolicy: "cache-and-network",
    },
    props: (props) => ({
      subscribeToMore: props.data.subscribeToMore,
      todos: props.data.listTodos ? props.data.listTodos.items : [],
      data: props.data,
    }),
  })
)(App);
