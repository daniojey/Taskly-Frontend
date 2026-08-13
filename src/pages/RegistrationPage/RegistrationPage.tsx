import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup'
import { api } from '../../../api';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext.jsx'
import { useNavigate } from "react-router"
import "./RegistrationPage.css"
import { Link } from 'react-router';


interface YupFormData {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

function RegistrationPage() {
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()
    
    const schema = yup.object({
        first_name: yup.string().max(250).required('This field is required'),
        last_name: yup.string().max(100).required('This field is required'),
        email: yup.string().email('This field type Email').required(),
        username: yup.string().test(
            'username-format',
            'Username может содержать только буквы, цифры и символы @/./+/-/_',
            (value) => {
                console.log(value)
                return true
            }
        ).required('This field is required'),
        password: yup.string().max(100).required('This field is required'),
        confirmPassword: yup.string().required().oneOf([yup.ref('password')], 'Passwords must match')
    })

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    })

    const handleSubmitForm = async (data: YupFormData) => {
        console.log(data)

        try {
            const response =await api.post(
                'api/v1/users/',
                {...data},
                {}
            )

            const result = await login(data.username, data.password)
            if (result === true) navigate('/');
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='registration-page__background'>
            <div className='registration-page__body'>
                <h3>Create an account</h3>
                <form onSubmit={handleSubmit(handleSubmitForm)} className='registration-form' id='registration-form'>
                    <div className='registration-form-field'>
                        <label htmlFor="first_name">First name</label>
                        <input className='holy_input' type="text" id='first_name' {...register('first_name')} />
                    </div>
                    <div className='registration-form-field'>
                        <label htmlFor="last_name">Last name</label>
                        <input className='holy_input'type="text" id='last_name' {...register('last_name')} />
                    </div>
                    <div className='registration-form-field'>
                        <label htmlFor="email">Email</label>
                        <input className='holy_input'type="text" id='email' {...register('email')} />
                    </div>
                    <div className='registration-form-field'>
                        <label htmlFor="username">Username</label>
                        <input className='holy_input'type="text" id='username' {...register('username')} />
                    </div>
                    <div className='registration-form-field'>
                        <label htmlFor="password">Password</label>
                        <input className='holy_input'type="password" id='password' {...register('password')} />
                    </div>
                    <div className='registration-form-field'>
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input className='holy_input'type="password" id='confirmPassword' {...register('confirmPassword')} />
                    </div>
                </form>
                <p>If you have account <Link to="/login">back to login</Link></p>
                <div className='registration-button-container'>
                    <button type='submit' form='registration-form'>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default RegistrationPage