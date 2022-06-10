import React, {useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import './stylesheets/login.css';

import AlertBox from './AlertBox';

import sendData from './sendData';

function LoginPage() {

    useEffect(() => {
        document.title = 'Sendjet | Login';
    });

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userActive, setUserActive] = useState('');
    const [passActive, setPassActive] = useState('');

    const [alertMessage, setAlertMessage] = useState('');
    const [alertActive, setAlertActive] = useState(false);

    const inputKeyDown = (e) => {
        setAlertActive(false);
        if (e.key == 'Enter') {
            login();
        }
    }

    const changeUsername = (e) => {
        setUsername(e.target.value);
        e.target.value.length > 0 ? setUserActive('active') : setUserActive('');
    }
    const changePassword = (e) => {
        setPassword(e.target.value);
        e.target.value.length > 0 ? setPassActive('active') : setPassActive('');
    }

    const login = async () => {
        if (!username || !password) {
            setAlertMessage('Please fill in all fields.');
            return setAlertActive(true);g
        } else {
            const userData = {
                username: username.trim(),
                password: password.trim(),
            };
            const response = await sendData('/login', userData);
            if (response.status != 'success') {
                setAlertMessage(response.message);
                return setAlertActive(true);
            } else if (response.status == 'success') {
                window.location.href = '/dashboard';
            }
        }
    }

    const showAlert = message => {
        setAlertMessage(message);
        setAlertActive(true);
    }

    return (
        <div className='LoginPage'>
            <AlertBox message={alertMessage} active={alertActive?1:0} />
            <div className='container'>
                <div className='title'>
                    <Link to='/'>
                        <img src='/title.svg' alt='logo' />
                    </Link>
                </div>
                <div className='links'>
                    <Link to='/signup' className='link' id='signup'>
                        <p>Sign up</p>
                    </Link>
                    <Link to='#' className='link' id='login'>
                        <p className='active'>Log in</p>
                    </Link>
                </div>
                <div className='inputs'>
                    <div className='input'>
                        <p className={`placeholder ${userActive}`}>Username</p>
                        <input className='input' type='text' onChange={changeUsername} onKeyDown={inputKeyDown} />
                    </div>
                   
                    <div className='input'>
                        <p className={`placeholder ${passActive}`}>Password</p>
                        <input className='input' type='password' onChange={changePassword} onKeyDown={inputKeyDown} />
                    </div>
                </div>
                <div className='buttons'>
                    <button className='right button' onClick={login}>Submit</button>
                </div>
                <div className='bottomText'>
                    <Link to='/forgotpassword' >
                        <p><i className="fa-solid fa-lock"></i> Forgot Password?</p>
                    </Link>
                    <p> &nbsp;|&nbsp;</p>
                    <Link to='/signup' >
                        <p>Don't have an account yet? <u>Sign up!</u></p>
                    </Link>
                </div>
                <hr />
            </div>
            
        </div>

    )
}

export default LoginPage;