module Navigation.Types exposing (..)

import Browse.Types
import Add.Types
import Wallet.Types
import UserBids.Types
import AcceptedBids.Types
import Settings.Types

type View
    = Browse
    | Add
    | Wallet
    | UserBids
    | AcceptedBids
    | Settings

type alias Model =
    { shown : View
    , models :
        { browse : Browse.Types.Model
        , add : Add.Types.Model
        , wallet : Wallet.Types.Model
        , userBids : UserBids.Types.Model
        , acceptedBids : AcceptedBids.Types.Model
        , settings : Settings.Types.Model
        }
    }

type Msg
    = Show View
    | ToBrowse Browse.Types.Msg
    | ToAdd Add.Types.Msg
    | ToWallet Wallet.Types.Msg
    | ToUserBids UserBids.Types.Msg
    | ToAcceptedBids AcceptedBids.Types.Msg
    | ToSettings Settings.Types.Msg
