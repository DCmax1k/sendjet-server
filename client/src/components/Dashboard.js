import React, {useEffect, useState } from 'react';

function Dashboard() {

    const setAuth = async () => {
        try {
            const response = await fetch('/dashboard', {
                method: 'POST',
            });
            const data = await response.json();
            console.log(data);
            if (data.status != 'success') return false;
            if (data.status == 'success') {
                setUser(data.user);
                return true;
            }
        } catch(err) {
            console.error(err);
        }
    }

    useEffect( async () => {
        const authenticated = await setAuth();
        if (!authenticated) return window.location.href = '/login';
    }, []);

    const [user, setUser] = useState({});

    return (
        <div className="Dashboard">
            <h1>Dashboard for {user.username}</h1>
        </div>
    )
}

export default Dashboard;