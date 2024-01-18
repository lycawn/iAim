import './Preloader.css';
import App from './App';

import { Suspense, useEffect, useRef, useState } from 'react';

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
          }, 2000);
        });
    }, 2500);
  }, []);

  return (
    <>
      {!completed ? (
        <>
          {!loading ? (
            <div className="spinner">
              <span>Everything is now</span>{' '}
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
