module UserBids.Types exposing (..)

import Bid.Types exposing (Bid)
import Error.Types

type alias Model =
    { bids : List Bid
    , error : Error.Types.Model
    }

type Msg
    = Noop
    | SetBids (List Bid)
    | ToError Error.Types.Msg
