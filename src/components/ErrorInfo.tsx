export default function ErrorInfo(props: { errors: string[] }) {

    let errorItems = [];
    for (let i = 0; i < props.errors.length; i++) {
        const error = props.errors[i];
        errorItems.push(<p key={i} className="errorText">{error}</p>);
    };

    return (
        <>
            {errorItems}
        </>
    );
}
