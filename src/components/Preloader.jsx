import './css/Preloader.css';
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
    }, 3500);
  }, []);

  return (
    <>
      {!completed ? (
        <>
          {!loading ? (
            <div className="spinner">
              <span>Life is being created, please wait</span>{' '}
            </div>
          ) : (
            <div className="spinner">
              <span>Loading completed</span>
              {/* <img
                src="./img/toothless-dragon-toothless.gif"
                width="260px"
                height="190px"
              /> */}
            </div>
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
