import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

function PersonalAccountPage() {

	const [firstName, setFirstName] = useState('')
	const [theme, setTheme] = useState('light')

	const navigate = useNavigate()

	useEffect(() => {

		// тут уже будет проверять не пропс loggedInUser, а то, что находится в cookie
		if (Cookies.get('refresh_token') !== undefined && Cookies.get('access_token') !== undefined) {
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
								.then(responseJson => {
									console.log(responseJson)
									if (responseJson.code = 'token_not_valid') {
										// тут обновляем наш access token
										// можно просто вывести в консольке для подтверждения что условие рабочее
									}
								})
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

		const newTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(newTheme)

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
					case 401:
						return response.json()
							.then(responseJson => {
								console.log(responseJson)
								if (responseJson.code = 'token_not_valid') {
									// тут обновляем наш access token
									// можно просто вывести в консольке для подтверждения что условие рабочее
								}
							})
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