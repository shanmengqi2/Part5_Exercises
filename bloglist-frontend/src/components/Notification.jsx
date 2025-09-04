const Notification = ({ info }) => {
  if (!info || info.message === null || info.message === undefined) {
    return null
  }

  return (
    <div className={info.mode}>
      {info.message}
    </div>
  )
}

export default Notification