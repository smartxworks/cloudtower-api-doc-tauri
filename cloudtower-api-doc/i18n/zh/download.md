import Download from '../../swagger/components/Download';

export const AddressWrapper = (props) => props.url ? <a href={props.url}>GitHub 地址</a> : <>暂未发布</>

| 语言 | 地址 |
| :-----| :----- |
| java | <AddressWrapper url={props.java_url} />| 
| go | <AddressWrapper url={props.go_url} /> | 
| python | <AddressWrapper url={props.python_url} />  | 
| node | <AddressWrapper url={props.node_url}/>  |
| json | <Download/> |
