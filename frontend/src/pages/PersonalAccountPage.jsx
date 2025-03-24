import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function PersonalAccountPage() {
  const [currentId, setCurrentId] = useState();
  const [firstName, setFirstName] = useState('');
  const [theme, setTheme] = useState('light');
  const [subscribersAmount, setSubscribersAmount] = useState();
  const [subscriptionsAmount, setSubscriptionsAmount] = useState();

  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  function updateAccessToken() {
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');

    // проверка на то, что access токен истек или не истек
    const decodedAccessToken = jwtDecode(accessToken);
    const expirationTimestamp = decodedAccessToken.exp; // Дата истечения в формате timestamp (в секундах)

    const currentTimestamp = Math.floor(Date.now() / 1000); // Текущая дата в формате timestamp

    if (currentTimestamp > expirationTimestamp) {
      fetch('http://127.0.0.1:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          Cookies.set('access_token', data['access']);
        });
    }
  }

  // получение информации о текущем пользователе
  useEffect(() => {
    if (
      Cookies.get('refresh_token') !== undefined &&
      Cookies.get('access_token') !== undefined
    ) {
      // сначала проверка на то, не истек ли access токен
      updateAccessToken();

      // выполнение основного запроса к API
      fetch('http://127.0.0.1:8000/api/user/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }).then((response) => {
        switch (response.status) {
          case 200:
            return response.json().then((responseJson) => {
              setCurrentId(responseJson['id']);
              setFirstName(responseJson['first-name']);
              setTheme(responseJson['theme']);
              setSubscribersAmount(responseJson['subscribers_amount']);
              setSubscriptionsAmount(responseJson['subscriptions_amount']);
            });
          case 401:
            return response
              .json()
              .then((responseJson) => console.log(responseJson));
          default:
            return response
              .text()
              .then((responseText) => console.log(responseText));
        }
      });
    }
  }, []);

  // получение информации о всех пользователях (не показываем своего пользователя)
  useEffect(() => {
    if (
      Cookies.get('refresh_token') !== undefined &&
      Cookies.get('access_token') !== undefined
    ) {
      // сначала проверка на то, не истек ли access токен
      updateAccessToken();

      // выполнение основного запроса к API
      fetch('http://127.0.0.1:8000/api/users/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      }).then((response) => {
        switch (response.status) {
          case 200:
            return response.json().then((responseJson) => {
              setUsers(responseJson);
            });
          case 401:
            return response
              .json()
              .then((responseJson) => console.log(responseJson));
          default:
            return response
              .text()
              .then((responseText) => console.log(responseText));
        }
      });
    }
  }, []);

  const subscribe = (userId) => {
    fetch('http://127.0.0.1:8000/api/users/subscribe', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Cookies.get('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_user: userId,
      }),
    }).then((response) => {
      switch (response.status) {
        case 200:
          return response.json().then((responseJson) => {
            setSubscriptionsAmount(subscriptionsAmount + 1);

            setUsers((users) =>
              users.map((user) => {
                if (user.id === userId) {
                  return {
                    ...user,
                    is_subscribed: true,
                  };
                } else {
                  return user;
                }
              })
            );
          });
        case 401:
          return response
            .json()
            .then((responseJson) => console.log(responseJson));
        default:
          return response
            .text()
            .then((responseText) => console.log(responseText));
      }
    });
  };

  const unsubscribe = (userId) => {
    fetch('http://127.0.0.1:8000/api/users/unsubscribe', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Cookies.get('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_user: userId,
      }),
    }).then((response) => {
      switch (response.status) {
        case 200:
          return response.json().then((responseJson) => {
            setSubscriptionsAmount(subscriptionsAmount - 1);

            setUsers((users) =>
              users.map((user) => {
                if (user.id === userId) {
                  return {
                    ...user,
                    is_subscribed: false,
                  };
                } else {
                  return user;
                }
              })
            );
          });
        case 401:
          return response
            .json()
            .then((responseJson) => console.log(responseJson));
        default:
          return response
            .text()
            .then((responseText) => console.log(responseText));
      }
    });
  };

  const onLogOutHandle = () => {
    setFirstName('');
    setTheme('light');
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    navigate('/auth');
  };

  const handleChangeTheme = () => {
    // сначала проверка на то, не истек ли access токен
    updateAccessToken();

    const newTheme = theme === 'light' ? 'dark' : 'light';

    fetch('http://127.0.0.1:8000/api/user' + '/changeTheme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('access_token')}`,
      },
      body: JSON.stringify({ theme: newTheme }),
    }).then((response) => {
      switch (response.status) {
        case 200:
          setTheme(newTheme);
          return;
        case 401:
          return response
            .json()
            .then((responseJson) => console.log(responseJson));
        default:
          return response
            .text()
            .then((responseText) => console.log(responseText));
      }
    });
  };

  const changeThemeButtonText =
    theme === 'light' ? 'Светлая тема' : 'Темная тема';

  return (
    <div className={theme === 'dark' ? 'darkBackground' : ''}>
      {Cookies.get('access_token') !== undefined &&
      Cookies.get('refresh_token') !== undefined ? (
        <>
          <div className={'header ' + (theme === 'dark' ? 'darkHeader' : '')}>
            <div
              onClick={handleChangeTheme}
              className={
                'header__theme ' + (theme === 'dark' ? 'darkButton' : '')
              }
            >
              {changeThemeButtonText}
            </div>
            <div
              onClick={onLogOutHandle}
              className={
                'header__exit ' + (theme === 'dark' ? 'darkButton' : '')
              }
            >
              Выйти
            </div>
          </div>
          <div className={'text ' + (theme === 'dark' ? 'darkText' : '')}>
            Добро пожаловать в личный кабинет, {firstName}!
          </div>

          <div className={`userData ${theme === 'dark' ? 'darkText' : ''}`}>
            <div>Количество подписок: {subscriptionsAmount}</div>
            <div>Количество подписчиков: {subscribersAmount}</div>
          </div>

          <div className={`users ${theme === 'dark' ? 'darkText' : ''}`}>
            <div>Список пользователей: </div>

            <div className="users__list">
              {users
                .filter((user) => user.id !== currentId)
                .map((user) => (
                  <div key={user.id} className="user">
                    <div>{user.username}</div>
                    <button
                      onClick={() =>
                        user.is_subscribed
                          ? unsubscribe(user.id)
                          : subscribe(user.id)
                      }
                    >
                      {user.is_subscribed ? 'Отписаться' : 'Подписаться'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : (
        <p className="notAuthText">
          Вы не авторизованы. <Link to="/auth">Авторизоваться.</Link>
        </p>
      )}
    </div>
  );
}

export default PersonalAccountPage;
