import React from 'react';
import { Link } from 'react-router-dom';
import './stylesheets/homePage.css';

function HomePage() {
  return (
    <div className='HomePage'>
      <div className='title'>
        <img src='/title.svg' alt='title logo' />
        <p>The easiest and most versatile way to message others</p>
      </div>
      <div className='rightSide'>
          <div className='content'>
          <h2>Message like a boss.</h2>
            <div className='links'>
                <Link to='/signup'>
                    <p className='link' id='signup'>Sign up</p>
                </Link>
                <Link to='/login'>
                    <p className='link' id='login'>Log in</p>
                </Link>
            </div>
          </div>
      </div>
    </div>
  );
}

export default HomePage;