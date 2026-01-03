import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup'
import { api } from '../../../api';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext.jsx'
import { useNavigate } from "react-router"


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
                <form onSubmit={handleSubmit(handleSubmitForm)}>
                    <div className='registration-form-field'></div>
                    <input className='neomorphism-input' type="text" id='first_name' {...register('first_name')} />
                    <input className='neomorphism-input'type="text" id='last_name' {...register('last_name')} />
                    <input className='neomorphism-input'type="text" id='email' {...register('email')} />
                    <input className='neomorphism-input'type="text" id='username' {...register('username')} />
                    <input className='neomorphism-input'type="text" id='password' {...register('password')} />
                    <input className='neomorphism-input'type="text" id='confirmPassword' {...register('confirmPassword')} />
                    <button type='submit'>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default RegistrationPage