
function GroupCard({ props }) {
    const { id, name } = props

    return (
        <>
            <div className="group-card__body">
                <div className="group-card__body-text">
                    {name}
                </div>
            </div>
        </>
    )
}


export default GroupCard