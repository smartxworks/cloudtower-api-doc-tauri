import Download from '../../swagger/components/Download';

export const AddressWrapper = (props) => props.url ? <a href={props.url}>GitHub Address</a> : <>Currently not released</>

| Language | URL |
| :-----| :----- |
| java | <AddressWrapper url={props.java_url} />| 
| go | <AddressWrapper url={props.go_url} /> | 
| python | <AddressWrapper url={props.python_url} />  | 
| node | <AddressWrapper url={props.node_url}/>  |
| json | <Download/> |
