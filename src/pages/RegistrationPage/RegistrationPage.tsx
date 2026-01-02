import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup'

interface YupFormData {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
}

function RegistrationPage() {
    
    const schema = yup.object({
        first_name: yup.string().max(250).required('This field is required'),
        last_name: yup.string().max(100).required('This field is required'),
        username: yup.string().test(
            'username-format',
            'Username может содержать только буквы, цифры и символы @/./+/-/_',
            (value) => {
                console.log(value)
                return true
            }
        ).required('This field is required'),
        password: yup.string().max(100).required('This field is required'),
    })

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    })

    return (
        <div className='registration-page__background'>
            <div className='registration-page__body'>
                <form>
                    <input type="text" id='first_name' {...register('first_name')} />
                    <input type="text" id='last_name' {...register('last_name')} />
                    <input type="text" id='username' {...register('username')} />
                    <input type="text" id='password' {...register('password')} />
                </form>
            </div>
        </div>
    )
}

export default RegistrationPage