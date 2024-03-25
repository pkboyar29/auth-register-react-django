import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

function PersonalAccountPage() {

	const [firstName, setFirstName] = useState('')
	const [theme, setTheme] = useState('light')

	const navigate = useNavigate()

	function updateAccessToken() {
		const accessToken = Cookies.get('access_token')
		const refreshToken = Cookies.get('refresh_token')

		// проверка на то, что access токен истек или не истек
		const decodedAccessToken = jwtDecode(accessToken);
		const expirationTimestamp = decodedAccessToken.exp; // Дата истечения в формате timestamp (в секундах)
		console.log(expirationTimestamp)

		const currentTimestamp = Math.floor(Date.now() / 1000); // Текущая дата в формате timestamp
		console.log(currentTimestamp)

		if (currentTimestamp > expirationTimestamp) {
			fetch('http://127.0.0.1:8000/api/token/refresh/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'refresh': refreshToken
				})
			})
				.then(response => response.json())
				.then(data => {
					Cookies.set('access_token', data['access'])
					console.log('изменилось')
				})
		}
	}

	useEffect(() => {
		if (Cookies.get('refresh_token') !== undefined && Cookies.get('access_token') !== undefined) {

			// сначала проверка на то, не истек ли access токен
			updateAccessToken()

			// выполнение основного запроса к API
			fetch('http://127.0.0.1:8000/api/user/', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${Cookies.get('access_token')}`
				}
			})
				.then(response => {
					switch (response.status) {
						case 200:
							return response.json()
								.then(responseJson => {
									setFirstName(responseJson['first-name'])
									setTheme(responseJson['theme'])
								})
						case 401:
							return response.json()
								.then(responseJson => console.log(responseJson))
						default:
							return response.text()
								.then(responseText => console.log(responseText))
					}
				})
		}
	}, [])

	const onLogOutHandle = () => {
		setFirstName('')
		setTheme('light')
		Cookies.remove('access_token')
		Cookies.remove('refresh_token')
		navigate('/auth')
	}

	const handleChangeTheme = () => {

		// сначала проверка на то, не истек ли access токен
		updateAccessToken()

		const newTheme = theme === 'light' ? 'dark' : 'light';

		fetch('http://127.0.0.1:8000/api/user' + '/changeTheme', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${Cookies.get('access_token')}`
			},
			body: JSON.stringify({ theme: newTheme })
		})
			.then(response => {
				switch (response.status) {
					case 200:
						setTheme(newTheme)
						return
					case 401:
						return response.json()
							.then(responseJson => console.log(responseJson))
					default:
						return response.text()
							.then(responseText => console.log(responseText))
				}
			})
	}

	const changeThemeButtonText = theme === 'light' ? 'Светлая тема' : 'Темная тема';

	return (
		<div className={theme === 'dark' ? 'darkBackground' : ''}>
			{Cookies.get('access_token') !== undefined && Cookies.get('refresh_token') !== undefined ? (
				<>
					<div className={"header " + (theme === 'dark' ? "darkHeader" : '')}>
						<div onClick={handleChangeTheme} className={"header__theme " + (theme === 'dark' ? "darkButton" : '')}>{changeThemeButtonText}</div>
						<div onClick={onLogOutHandle} className={"header__exit " + (theme === 'dark' ? "darkButton" : '')}>Выйти</div>
					</div>
					<div className={"text " + (theme === 'dark' ? 'darkText' : '')}>Добро пожаловать в личный кабинет, {firstName}!</div>
				</>
			) : (
				<p className="notAuthText">Вы не авторизованы. <Link to="/auth">Авторизоваться.</Link></p>
			)}
		</div>
	)
}

export default PersonalAccountPage