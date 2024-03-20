import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Cookies from 'js-cookie';

function AuthPage() {

   // Хук useState
   const [showPassword, setShowPassword] = useState(false);
   const [captchaPassed, setCaptchaPassed] = useState(false)

   const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
   };

   // Хук useNavigate
   const navigate = useNavigate()

   // Хук useForm
   const {
      register,
      setError,
      formState: { errors, isValid },
      handleSubmit
   } = useForm({
      mode: "onBlur"
   });

   const recaptchaRef = useRef()

   // функция обратного вызова (та функция, которую можно передать как параметр в другую функцию)
   const onSubmit = (data) => {
      // передача на сервер json строки
      fetch('http://auth-register-backend/index.php/user/auth', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: JSON.stringify(data)
      })
         .then(response => {
            // проверяем код состояния ответа (http reponse code status)
            switch (response.status) {
               case 200:
                  const loginFromInput = data['login'] // получаем правильный, подтвержденный логин из input
                  Cookies.set('login', loginFromInput)
                  navigate('/personal-account')
                  return
               case 403:
                  setError('password', {
                     type: 'manual',
                     message: 'Неверный пароль'
                  })
                  recaptchaRef.current.reset()
                  setCaptchaPassed(false)
                  return
               case 404:
                  setError('login', {
                     type: 'manual',
                     message: 'Пользователя с таким логином не существует'
                  })
                  recaptchaRef.current.reset()
                  setCaptchaPassed(false)
                  return
            }
         })
   }

   const onChangeCaptcha = (value) => {

      // отправить токен на сервер и проверить его там, обратившись к reCAPTCHA API
      fetch('http://auth-register-backend/index.php/token', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: JSON.stringify(value)
      })
         .then(response => {
            switch (response.status) {
               case 200:
                  setCaptchaPassed(true)
                  return
               case 400:
                  console.log("все плохо")
                  return
               default:
                  return
            }
         })
   }

   return (

      <div style={{ marginTop: '50px' }}>
         {/* функция handleSubmit принимает как параметр callback функцию */}
         <form onSubmit={handleSubmit(onSubmit)} className="form">

            <div className="form__title">Форма авторизации</div>

            {/* Login */}
            <label>
               <div className="label">
                  <div className="label__title">Логин</div>
                  <input
                     {...register('login', {
                        required: 'Логин не указан'
                     })}
                     type="text"
                     autoComplete="off"
                  />

               </div>

               <div id="label_login" style={{ height: 40 }}>
                  {errors?.login && <p className="error">{errors?.login?.message || "Error!"}</p>}
               </div>
            </label>

            {/* Password */}
            <label>
               <div className="password__input">
                  <div>Пароль</div>

                  <input
                     {...register('password', {
                        required: 'Пароль не указан'
                     })}
                     type={showPassword ? 'text' : 'password'}
                     autoComplete="off"
                  />

                  <img className="show" onClick={togglePasswordVisibility} src={showPassword ? "/img/eye.svg" : "/img/eye-off.svg"} />

               </div>

               <div id="label_password" style={{ height: 40 }}>
                  {errors?.password && <p className="error">{errors?.password?.message || "Error!"}</p>}
               </div>
            </label>

            {/* reCAPTCHA v2 */}
            <ReCAPTCHA
               ref={recaptchaRef}
               className="captcha"
               sitekey="6LdxW4gpAAAAAMfJ5sANc6u5HMmxZ5TBKIKoBkTg"
               onChange={onChangeCaptcha}
            />

            {/* SUBMIT BUTTON */}
            <input className="submit_button" type="submit" value="Авторизоваться" disabled={!isValid || !captchaPassed} />


            <div className="switch">
               <div>Еще не зарегестрированы?</div>
               <Link to="/register" className="link">Зарегестрироваться.</Link>
            </div>

         </form>
      </div>
   )
}

export default AuthPage;