import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

function PersonalAccountPage() {

	const [firstName, setFirstName] = useState('')
	const [theme, setTheme] = useState('light')

	const navigate = useNavigate()

	useEffect(() => {

		// тут уже будет проверять не пропс loggedInUser, а то, что находится в cookie
		if (Cookies.get('login') !== undefined) {
			fetch('http://127.0.0.1:8000/api/user/' + Cookies.get('login'), {
				method: 'GET'
			})
				.then(response => response.json())
				.then(responseJson => {
					setFirstName(responseJson['first-name'])
					setTheme(responseJson['theme'])
				})
		}
	}, [])

	const onLogOutHandle = () => {
		setFirstName('')
		setTheme('light')
		Cookies.remove('login')
		navigate('/auth')
	}

	const handleChangeTheme = () => {

		// Определяем новое значение темы
		const newTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(newTheme)

		// отправить http запрос на изменении самой темы у текущего пользователя
		fetch('http://auth-register-backend/index.php/user/changeTheme/' + Cookies.get('login'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: JSON.stringify({ Theme: newTheme })
		})
			.then(response => response.json())
			.then(response => console.log(response))
	}

	const changeThemeButtonText = theme === 'light' ? 'Светлая тема' : 'Темная тема';

	return (
		<div className={theme === 'dark' ? 'darkBackground' : ''}>
			{Cookies.get('login') !== undefined ? ( // вот тут теперь будет проверять то, что в cookie
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