export type TaskItemProps = {
    task: {
        id : number;
        description : string;
        date : string;
        status : string;
    };
    onComplete : (id: number) => void;
}