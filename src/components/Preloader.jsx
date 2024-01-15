import React, { useEffect, useState } from 'react';
import './Preloader.css';
import App from './App';
function Preloader() {
  const [data, setData] = useState([]);
  const [loading, setloading] = useState(undefined);
  const [completed, setcompleted] = useState(undefined);

  useEffect(() => {
    setTimeout(() => {
      fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => response.json())
        .then(json => {
          console.log(json);
          setData(json);
          setloading(true);

          setTimeout(() => {
            setcompleted(true);
          }, 1000);
        });
    }, 1500);
  }, []);

  return (
    <>
      {!completed ? (
        <>
          {!loading ? (
            <div className="spinner">
              <span>All is now</span>
            </div>
          ) : (
            <div className="completed"> </div>
          )}
        </>
      ) : (
        <>
          <div>
            {' '}
            <App />
          </div>
        </>
      )}
    </>
  );
}

export default Preloader;
