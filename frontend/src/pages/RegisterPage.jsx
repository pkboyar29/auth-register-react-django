import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Cookies from 'js-cookie';

import validator from 'email-validator';

function RegisterPage() {

   // Хуки useState
   const [showPassword, setShowPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
   const [captchaPassed, setCaptchaPassed] = useState(false)

   const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
   };

   const toggleConfirmPasswordVisibility = () => {
      setShowConfirmPassword(!showConfirmPassword);
   };

   // Хук useNavigate для изменения URL
   const navigate = useNavigate()

   // Хук useForm
   const {
      register,
      setError,
      formState: { errors, isValid },
      handleSubmit,
      getValues
   } = useForm({
      mode: "onBlur"
   });

   // функция обратного вызова (та функция, которую можно передать как параметр в другую функцию)
   const onSubmit = (data) => {
      delete data.confirmPassword

      fetch('http://127.0.0.1:8000/api/register', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(data)
      })
         .then(response => {
            switch (response.status) {
               case 201:
                  return response.json()
                     .then(data => {
                        const { access_token, refresh_token } = data
                        Cookies.set('access_token', access_token)
                        Cookies.set('refresh_token', refresh_token)
                        alert("Регистрация успешна!")
                        navigate('/personal-account')
                     })
               case 403:
                  setError('username', {
                     type: 'manual',
                     message: 'Пользователь с таким логином уже существует'
                  })
                  return
               default:
                  console.log(response.text())
                  return
            }
         }
         )
   }

   const onChangeCaptcha = (value) => {

      fetch('http://127.0.0.1:8000/api/checkCaptchaToken', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ 'token': value })
      })
         .then(response => {
            switch (response.status) {
               case 200:
                  setCaptchaPassed(true)
                  return
               case 500:
                  setCaptchaPassed(false)
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

            <div className="form__title">Форма регистрации</div>

            {/* First Name */}
            <label>
               <div className="label">
                  <div className="label__title">Имя</div>
                  <input
                     {...register('first_name', {
                        required: "Поле обязательно к заполнению",
                        minLength: {
                           value: 2,
                           message: "Минимальное количество символов: 2"
                        },
                        maxLength: {
                           value: 15,
                           message: "Максимальное количество символов: 15"
                        },
                        pattern: {
                           value: /^[A-Za-zА-Яа-яЁё]+$/,
                           message: "Допускаются только буквы"
                        }
                     })}
                     type="text"
                     autoComplete="off"
                  />
               </div>
               <div style={{ height: 40 }}>
                  {errors?.first_name && <p className="error">{errors?.first_name?.message || "Error!"}</p>}
               </div>
            </label>
            {/* Last Name */}
            <label>
               <div className="label">
                  <div className="label__title">Фамилия</div>
                  <input
                     {...register('last_name', {
                        required: "Поле обязательно к заполнению",
                        minLength: {
                           value: 2,
                           message: "Минимальное количество символов: 2"
                        },
                        maxLength: {
                           value: 15,
                           message: "Максимальное количество символов: 15"
                        },
                        pattern: {
                           value: /^[A-Za-zА-Яа-яЁё\s\-]+$/, // Разрешаем буквы, пробелы и дефисы
                           message: "Допускаются только буквы, пробелы и дефисы"
                        },
                        validate: {
                           checkWhitespaces: (value) => {
                              const trimmedValue = value.trim()
                              if (trimmedValue !== value) {
                                 return "В начале и конце не должно быть пробелов"
                              }
                           }
                        }
                     })}
                     type="text"
                     autoComplete="off"
                  />
               </div>

               <div style={{ height: 40 }}>
                  {errors?.last_name && <p className="error">{errors?.last_name?.message || "Error!"}</p>}
               </div>
            </label>
            {/* Email */}
            <label>
               <div className="label">
                  <div className="label__title">Email</div>
                  <input
                     {...register('email', {
                        required: "Поле обязательно к заполнению",
                        validate: {
                           checkEmailFormat: (value) => {
                              return validator.validate(value) || "Неверный формат email"
                           }
                        }
                     })}
                     type="email"
                     autoComplete="off"
                  />
               </div>

               <div style={{ height: 40 }}>
                  {errors?.email && <p className="error">{errors?.email?.message || "Error!"}</p>}
               </div>
            </label>

            {/* Username */}
            <label>
               <div className="label">
                  <div className="label__title">Логин</div>
                  <input
                     {...register('username', {
                        required: "Поле обязательно к заполнению",
                        minLength: {
                           value: 6,
                           message: "Минимальное количество символов: 6"
                        },
                        maxLength: {
                           value: 15,
                           message: "Максимальное количество символов: 15"
                        },
                        pattern: {
                           value: /^[a-zA-Z0-9]+$/,
                           message: "Допускаются только латинские буквы и цифры"
                        }
                     })}
                     type="text"
                     autoComplete="off"
                  />
               </div>

               <div style={{ height: 40 }}>
                  {errors?.username && <p className="error">{errors?.username?.message || "Error!"}</p>}
               </div>
            </label>

            {/* Password */}
            <label>
               <div className="password__input">
                  <div>Пароль</div>

                  <div className="password__field">
                     <input
                        {...register('password', {
                           required: "Поле обязательно к заполнению",
                           minLength: {
                              value: 8,
                              message: "Минимальная длина пароля: 8 символов"
                           },
                           pattern: {
                              value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/,
                              message: "Пароль должен содержать по крайней мере одну прописную букву, одну строчную букву, одну цифру и один специальный символ (!@#$%^&*)"
                           }
                        })}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="off"
                     />
                     <img className="show" onClick={togglePasswordVisibility} src={showPassword ? "/img/eye.svg" : "/img/eye-off.svg"} />
                  </div>

               </div>

               <div style={{ height: 40 }}>
                  {errors?.password && <p className="error">{errors?.password?.message || "Error!"}</p>}
               </div>
            </label>

            {/* Confirm password */}
            <label>
               <div className="password__input">
                  <div>Подтвердите пароль</div>

                  <div className="password__field">
                     <input
                        {...register('confirmPassword', {
                           required: "Поле обязательно к заполнению",
                           validate: {
                              matchesPreviousPassword: (value) => {
                                 const { password } = getValues();
                                 return password === value || "Пароли не совпадают";
                              }
                           }
                        })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="off"
                     />

                     <img className="show" onClick={toggleConfirmPasswordVisibility} src={showConfirmPassword ? "/img/eye.svg" : "/img/eye-off.svg"} />
                  </div>

               </div>

               <div style={{ height: 40 }}>
                  {errors?.confirmPassword && <p className="error">{errors?.confirmPassword?.message || "Error!"}</p>}
               </div>
            </label>

            {/* RADIO BUTTONS: GENDER */}
            <div>
               <div className="gender__title">Пол</div>

               <div className="gender__list">
                  <label>
                     <input
                        {...register('gender')}
                        type="radio"
                        value="male"
                        defaultChecked />
                     Мужской
                  </label>

                  <label>
                     <input
                        {...register('gender')}
                        type="radio"
                        value="female" />
                     Женский
                  </label>
               </div>
            </div>

            {/* DROPDOWN MENU: AGE */}
            <div className="age__title">Возраст</div>
            <select className="age__select" {...register('age_limit', { required: "Выберите возраст" })}>
               <option value="">Выберите возраст</option>
               <option value="18">Мне 18 лет</option>
               <option value="not18">Нет 18 лет</option>
            </select>

            {/* ACCEPT RULES */}
            <label className="accept__label">
               <input
                  {...register('accept_rules')}
                  type="checkbox"
               />
               Принимаю правила соглашения
            </label>

            {/* reCAPTCHA v2 */}
            <ReCAPTCHA
               className="captcha"
               sitekey="6LdxW4gpAAAAAMfJ5sANc6u5HMmxZ5TBKIKoBkTg"
               onChange={onChangeCaptcha}
            />

            {/* SUBMIT BUTTON */}
            <input className="submit_button" type="submit" value="Зарегестрироваться" disabled={!isValid || !captchaPassed} />

            <div className="switch">
               <div>Уже зарегестрированы?   </div>
               <Link to="/auth" className="link">Тогда авторизуйтесь.</Link>
            </div>

         </form>

      </div>
   )
}

export default RegisterPage;