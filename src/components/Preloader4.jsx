import React, { useEffect, useState, Suspense } from 'react';
import './css/Preloader.css';
import Home from './Home';
import Koicat from './Models/Koicat';
import Portfolio from './Portfolio';
import { Canvas, useFrame } from '@react-three/fiber';
import Vvideo from './assets/carVideo.mp4';
import Cardealer from './Cardealer';

function Preloader3() {
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
          }, 9000);
        });
    }, 2000);
  }, []);

  return (
    <>
      {!completed ? (
        <>
          {!loading ? (
            <div className="spinner">
              <span>Akenzi Automotives</span>
            </div>
          ) : (
            <div className="spinner">
              {' '}
              <video autoPlay loop src={Vvideo}></video>{' '}
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            {' '}
            <Cardealer />
          </div>
        </>
      )}
    </>
  );
}

export default Preloader3;
