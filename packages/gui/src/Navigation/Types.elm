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
    | TriggerPassword
        (List String)
        (Maybe Msg)
        (Maybe Msg)
        Msg


mapAdd : Add.Types.Msg -> Msg
mapAdd msg =
    case msg of
        Add.Types.TriggerPassword promptedPasswords before onCancel onSubmit ->
            TriggerPassword
                promptedPasswords
                (Maybe.map mapAdd before)
                (Maybe.map mapAdd onCancel)
                (mapAdd onSubmit)

        _ ->
            ToAdd msg


mapBrowse : Browse.Types.Msg -> Msg
mapBrowse msg =
    case msg of
        Browse.Types.TriggerPassword promptedPasswords before onCancel onSubmit ->
            TriggerPassword
                promptedPasswords
                (Maybe.map mapBrowse before)
                (Maybe.map mapBrowse onCancel)
                (mapBrowse onSubmit)

        _ ->
            ToBrowse msg


mapUserBids : UserBids.Types.Msg -> Msg
mapUserBids msg =
    case msg of
        UserBids.Types.TriggerPassword promptedPasswords before onCancel onSubmit ->
            TriggerPassword
                promptedPasswords
                (Maybe.map mapUserBids before)
                (Maybe.map mapUserBids onCancel)
                (mapUserBids onSubmit)

        _ ->
            ToUserBids msg
