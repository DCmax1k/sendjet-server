import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import './stylesheets/login.css';

import AlertBox from './AlertBox';

import sendData from './sendData';

function SignupPage() {

    useEffect(() => {
        document.title = 'Sendjet | Signup';
    });

    const [currentPage, setCurrentPage] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [firstNameActive, setFirstNameActive] = useState('');
    const [lastNameActive, setLastNameActive] = useState('');
    const [emailActive, setEmailActive] = useState('');
    const [usernameActive, setUsernameActive] = useState('');
    const [passwordActive, setPasswordActive] = useState('');
    const [confirmPasswordActive, setConfirmPasswordActive] = useState('');

    const [alertMessage, setAlertMessage] = useState('');
    const [alertActive, setAlertActive] = useState(false);

    const changeUsername = (e) => {
        setUsername(e.target.value);
        e.target.value.length > 0 ? setUsernameActive('active') : setUsernameActive('');
    }
    const changePassword = (e) => {
        setPassword(e.target.value);
        e.target.value.length > 0 ? setPasswordActive('active') : setPasswordActive('');
    }
    const changeConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
        e.target.value.length > 0 ? setConfirmPasswordActive('active') : setConfirmPasswordActive('');
    }
    const changeFirstName = (e) => {
        setFirstName(e.target.value);
        e.target.value.length > 0 ? setFirstNameActive('active') : setFirstNameActive('');
    }
    const changeLastName = (e) => {
        setLastName(e.target.value);
        e.target.value.length > 0 ? setLastNameActive('active') : setLastNameActive('');
    }
    const changeEmail = (e) => {
        setEmail(e.target.value);
        e.target.value.length > 0 ? setEmailActive('active') : setEmailActive('');
    }

    const inputKeyDown = (e) => {
        setAlertActive(false);
        if (e.key == 'Enter') {
            if (currentPage === '') {
                switchPage();
            } else if (currentPage === 'active') {
                if (firstName && lastName && email && username && password && confirmPassword) {
                    signup();
                } else {
                    setAlertMessage('Please fill all fields');
                    setAlertActive(true);
                }
            }
        }
    }

    const switchPage = () => {

        if (currentPage === '') {
            if (firstName && lastName && email) {
                if (!validateEmail(email)) {
                    setAlertMessage('Please enter a valid email');
                    return setAlertActive(true);
                }
                setCurrentPage('active');
            } else {
                setAlertMessage('Please fill all fields');
                setAlertActive(true);
            }
        } else if (currentPage === 'active'){
            setCurrentPage('');
        }
    }

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    function validatePass(pass) {
        return pass.length >= 8;
    }

    const signup = async () => {
        if (password !== confirmPassword) {
            setAlertMessage('Passwords do not match');
            return setAlertActive(true);
        }
        if (username.trim().length > 10) {
            setAlertMessage('Username must be 10 characters or less');
            return setAlertActive(true);
        }
        if (!validatePass(password.trim())) {
            setAlertMessage('Password must be at least 8 characters long');
            return setAlertActive(true);
        }

        const userData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            username: username.trim(),
            password: password.trim(),
            confirmPassword: confirmPassword.trim(),
        };
        const response = await sendData('/signup', userData);
        console.log(response);
        if (response.status != 'success') {
            setAlertMessage(response.message);
            return setAlertActive(true);
        } else if (response.status == 'success') {
            window.location.href = '/dashboard';
        }
    }

    return (
        <div className='LoginPage SignupPage'>
            <AlertBox message={alertMessage} active={alertActive?1:0} />
            <div className='container'>
                <div className='title'>
                    <Link to='/'>
                        <img src='/title.svg' alt='logo' />
                    </Link>
                </div>
                <div className='links'>
                    <Link to='#' className='link' id='signup'>
                        <p className='active'>Sign up</p>
                    </Link>
                    <Link to='/login' className='link' id='login'>
                        <p>Log in</p>
                    </Link>
                </div>
                <div className={`pages ${currentPage}`}>
                    <div className='page1'>
                        <div className='inputs'>
                            <div className='input'>
                                <p className={`placeholder ${firstNameActive}`}>First name</p>
                                <input className='input' type='text' onChange={changeFirstName} onKeyDown={inputKeyDown} />
                            </div>
                        
                            <div className='input'>
                                <p className={`placeholder ${lastNameActive}`}>Last name</p>
                                <input className='input' type='text' onChange={changeLastName} onKeyDown={inputKeyDown} />
                            </div>

                            <div className='input'>
                                <p className={`placeholder ${emailActive}`}>Email</p>
                                <input className='input' type='email' onChange={changeEmail} onKeyDown={inputKeyDown} />
                            </div>
                        </div>
                        <div className='buttons'>
                            <button className='right button' onClick={switchPage} onKeyDown={inputKeyDown} >Next step</button>
                        </div>
                    </div>
                    <div className='page2'>
                        <div className='inputs'>
                        <div className='input'>
                                <p className={`placeholder ${usernameActive}`}>Username</p>
                                <input className='input username' type='text' onChange={changeUsername} onKeyDown={inputKeyDown} />
                            </div>
                        
                            <div className='input'>
                                <p className={`placeholder ${passwordActive}`}>Password</p>
                                <input className='input' type='password' onChange={changePassword} onKeyDown={inputKeyDown} />
                            </div>

                            <div className='input'>
                                <p className={`placeholder ${confirmPasswordActive}`}>Confirm password</p>
                                <input className='input' type='password' onChange={changeConfirmPassword} onKeyDown={inputKeyDown} />
                            </div>
                        </div>
                        <div className='buttons'>
                            <button className='button' onClick={switchPage} >Back</button>
                            <button className='right button' onClick={signup} >Create Account!</button>
                        </div>
                    </div>
                </div>

                <div className='bottomText'>
                    <Link to='/login' >
                        <p><i className="fa-solid fa-lock"></i> Already have an account? Log in</p>
                    </Link>
                </div>
                <hr />
            </div>
            
        </div>

    )
}

export default SignupPage;