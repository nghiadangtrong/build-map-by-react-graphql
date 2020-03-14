import React, {useState, useContext} from "react";
import { withStyles, Input, Icon } from "@material-ui/core";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from "@material-ui/icons/Send";
import Divider from "@material-ui/core/Divider";

import {CREATE_COMMENT_MUTATION} from '../../graphql/mutations';
import {useClient} from '../../client';
import Context from '../../context'

const CreateComment = ({ classes }) => {
  const client  = useClient()
  const [comment, setComment] = useState("")
  const {state} = useContext(Context)

  const handleSubmitComment = async ()=> {
    const variables = {pinId: state.currentPin._id, text: comment}
    await client.request(CREATE_COMMENT_MUTATION, variables)

    // Dùng websocket apollo upate to context 
    // dispatch({type: "CREATE_COMMENT", payload: createComment});
    
    setComment("")
  }
  
  return (
    <>
      <form className={classes.form}>
        <IconButton 
          disabled={!comment.trim()} 
          onClick={() => setComment("")}
          className={classes.clearButton}>
          <ClearIcon />
        </IconButton>
        <InputBase 
          className={classes.input} 
          placeholder="Add comment" 
          multiline={true} 
          onChange={e => setComment(e.target.value)}
          value={comment}
        />
        <IconButton 
          onClick={handleSubmitComment}
          className={classes.sendButton}>
          <SendIcon />
        </IconButton>
      </form>
      <Divider />
    </>
  )
};

const styles = theme => ({
  form: {
    display: "flex",
    alignItems: "center"
  },
  input: {
    marginLeft: 8,
    flex: 1
  },
  clearButton: {
    padding: 0,
    color: "red"
  },
  sendButton: {
    padding: 0,
    color: theme.palette.secondary.dark
  }
});

export default withStyles(styles)(CreateComment);
