module Error.Types exposing (..)

type alias Model =
    { message : String
    , title : String
    }

type Msg
    = Display String String
    | Dismiss
