import React, { useEffect, useState } from 'react';
import './Preloader.css';
import Home from './Home';
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
          }, 500);
        });
    }, 1000);
  }, []);

  return (
    <>
      {!completed ? (
        <>
          {!loading ? (
            <div className="spinner">
              <span>Welcome to iAim..</span>
            </div>
          ) : (
            <div className="completed"> </div>
          )}
        </>
      ) : (
        <>
          <div>
            {' '}
            <Home />
          </div>
        </>
      )}
    </>
  );
}

export default Preloader;
