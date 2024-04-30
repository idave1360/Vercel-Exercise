"use client";

import React, { useEffect, useState } from 'react';
import TodoItem from '@/components/TodoItem';
// import styles from '@/styles/TodoList.module.css';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// firebase 관련 모듈을 불러옵니다.
import { db } from '@/firebase';
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
} from 'firebase/firestore';
import { get, set } from 'express/lib/response';

// DB의 todos 컬렉션 참조를 만듭니다. 컬렉션 사용시 잘못된 컬렉션 이름 사용을 방지합니다.
const todoCollection = collection(db, 'todos');

const TodoList = () => {
  // 상태를 관리하는 useState 훅을 사용하여 할 일 목록과 입력값을 초기화합니다.
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    getTodos();
  } , []);

  const getTodos = async () => {
    // Firestore 쿼리를 만듭니다.
    const q = query(todoCollection);

    // Fires store 에서 할 일 목록을 조회합니다.
    const results = await getDocs(q);
    const newTodos = [];

    // 가져온 할 일 목록을 newTodos 배열에 담습니다.
    results.docs.forEach((doc) => {
      // id 값을 Firebase 에 저장한 값으로 지정하고, 나머지 데이터를 newtodos 배열에 담습니다.
      newTodos.push({ id: doc.id, ...doc.data() });
    });

    setTodos(newTodos);
  };

  // addTodo 함수는 입력값을 이용하여 새로운 할 일을 목록에 추가하는 함수입니다.
  const addTodo = async() => {
    // 입력값이 비어있는 경우 함수를 종료합니다.
    if (input.trim() === "") return;
    // 기존 할 일 목록에 새로운 할 일을 추가하고, 입력값을 초기화합니다.
    // {
    //   id: 할일의 고유 id,
    //   text: 할일의 내용,
    //   completed: 완료 여부,
    // }
    // ...todos => {id: 1, text: "할일1", completed: false}, {id: 2, text: "할일2", completed: false}}, ..

    // Firesotre 에 추가한 일을 저장합니다.
    const docRef = await addDoc(todoCollection, {
      text: input,
      completed: false,
    });

    // id 값을 Firestore 에 저장한 값으로 지정합니다.
    setTodos([...todos, { id: docRef.id, text: input, completed: false }]);
    setInput("");
  };

  // toggleTodo 함수는 체크박스를 눌러 할 일의 완료 상태를 변경하는 함수입니다.
  const toggleTodo = (id) => {
    // 할 일 목록에서 해당 id를 가진 할 일의 완료 상태를 반전시킵니다.
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          // Firestore 에서 해당 id를 가진 할 일의 완료 상태를 업데이트합니다.
          const todoDoc = doc(todoCollection, id)
          updateDoc(todoDoc, { completed: !todo.completed });
          return { ...todo, completed: !todo.completed };
        } else {
          return todo;
        }
      })
    )
  };

  // deleteTodo 함수는 할 일을 목록에서 삭제하는 함수입니다.
  const deleteTodo = (id) => {
    // Firestore 에서 해당 id를 가진 할 일을 삭제합니다.
    const todoDoc = doc(todoCollection, id);
    deleteDoc(todoDoc);

    // 해당 id를 가진 할 일ㅇ르 제외한 나머지 목록을 새로운 상태로 저장합니다.
    setTodos(
      todos.filter((todo) => {
        return todo.id !== id;
      })
    )
  };

  // 컴포넌트를 렌더링합니다.
  return (
    <div className="mx-auto max-w-sm p-5 bg-white rounded-lg shadow">
      <h1 className="text-center text-2xl font-bold">Todo List</h1>
      <Input
        className="w-full p-1 mb-2 text-black border-2 border-gray-200 rounded shadow focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add new todo"
      />
      <Button
        className="w-full p-1 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600 active:translate-y-1 transform transition mr-2"
        onClick={addTodo}
      >
        Add Todo
      </Button>
  

      <ul className="list-none p-0">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </ul>
      {todos.length === 0 && (
      <div className="text-center mt-5">
        <img src="empty-list-image.png" alt="Empty list" className="mx-auto w-1/2" />
        <p className="text-lg mt-2">할 일이 없습니다.</p>
      </div>
      
      )}
    </div>
  );
};

export default TodoList;
